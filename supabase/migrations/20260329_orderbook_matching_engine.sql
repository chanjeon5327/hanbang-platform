-- DAY 1: Real Matching Engine
-- orderbook_orders 확장 + rpc_match_orders

ALTER TABLE public.orderbook_orders ADD COLUMN IF NOT EXISTS remaining_quantity numeric(20,6);
UPDATE public.orderbook_orders SET remaining_quantity = quantity - COALESCE(filled_quantity, 0) WHERE remaining_quantity IS NULL;
ALTER TABLE public.orderbook_orders ALTER COLUMN remaining_quantity SET DEFAULT 0;

-- content_id = item_id (alias for spec)
CREATE INDEX IF NOT EXISTS idx_orderbook_orders_item_status ON public.orderbook_orders(content_id, status) WHERE status IN ('open', 'partial');

-- price_krw for ledger
ALTER TABLE public.orderbook_orders ADD COLUMN IF NOT EXISTS price_krw numeric(20,0);
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS price_krw numeric(20,0);

-- rpc_match_orders: 동일 가격 교차 매칭, 부분체결, ledger 반영
CREATE OR REPLACE FUNCTION public.rpc_match_orders(p_item_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_bid record;
  v_ask record;
  v_match_qty numeric;
  v_price_usd numeric;
  v_price_krw numeric;
  v_fx numeric := 1350;
  v_trade_id uuid;
  v_matched_count int := 0;
BEGIN
  SELECT share_price_usd INTO v_price_usd FROM content_items WHERE id = p_item_id LIMIT 1;
  IF v_price_usd IS NULL THEN v_price_usd := 10; END IF;
  v_price_krw := ROUND(v_price_usd * v_fx, 0);

  FOR v_bid IN
    SELECT id, user_id, quantity, COALESCE(remaining_quantity, quantity - COALESCE(filled_quantity,0)) AS rem, price_usd, COALESCE(price_krw, ROUND(price_usd * v_fx, 0)) AS pk
    FROM orderbook_orders
    WHERE content_id = p_item_id AND side = 'bid' AND status IN ('open', 'partial')
      AND COALESCE(remaining_quantity, quantity - COALESCE(filled_quantity,0)) > 0
    ORDER BY price_usd DESC, created_at ASC
    FOR UPDATE SKIP LOCKED
  LOOP
    FOR v_ask IN
      SELECT id, user_id, quantity, COALESCE(remaining_quantity, quantity - COALESCE(filled_quantity,0)) AS rem, price_usd, COALESCE(price_krw, ROUND(price_usd * v_fx, 0)) AS pk
      FROM orderbook_orders
      WHERE content_id = p_item_id AND side = 'ask' AND status IN ('open', 'partial')
        AND COALESCE(remaining_quantity, quantity - COALESCE(filled_quantity,0)) > 0
        AND price_usd <= v_bid.price_usd
      ORDER BY price_usd ASC, created_at ASC
      FOR UPDATE SKIP LOCKED
    LOOP
      v_match_qty := LEAST(v_bid.rem, v_ask.rem);
      IF v_match_qty <= 0 THEN EXIT; END IF;

      v_trade_id := gen_random_uuid();
      INSERT INTO trades (content_id, bid_order_id, ask_order_id, price_usd, price_krw, quantity, buyer_id, seller_id)
      VALUES (p_item_id, v_bid.id, v_ask.id, v_ask.price_usd, COALESCE(v_ask.pk, ROUND(v_ask.price_usd * v_fx, 0)), v_match_qty, v_bid.user_id, v_ask.user_id);

      UPDATE orderbook_orders SET
        filled_quantity = COALESCE(filled_quantity, 0) + v_match_qty,
        remaining_quantity = quantity - (COALESCE(filled_quantity, 0) + v_match_qty),
        status = CASE WHEN quantity <= COALESCE(filled_quantity, 0) + v_match_qty THEN 'filled' ELSE 'partial' END,
        updated_at = now()
      WHERE id = v_bid.id;

      UPDATE orderbook_orders SET
        filled_quantity = COALESCE(filled_quantity, 0) + v_match_qty,
        remaining_quantity = quantity - (COALESCE(filled_quantity, 0) + v_match_qty),
        status = CASE WHEN quantity <= COALESCE(filled_quantity, 0) + v_match_qty THEN 'filled' ELSE 'partial' END,
        updated_at = now()
      WHERE id = v_ask.id;

      INSERT INTO ledger_entries (user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata)
      VALUES
        (v_bid.user_id, v_trade_id, 'ASSET_CREDIT', 'KRW', 0, p_item_id, v_match_qty, 'TRADE_BUY', jsonb_build_object('trade_id', v_trade_id)),
        (v_bid.user_id, v_trade_id, 'CASH_DEBIT', 'KRW', ROUND(v_match_qty * COALESCE(v_ask.pk, v_ask.price_usd * v_fx), 0), NULL, 0, 'TRADE_BUY', jsonb_build_object('trade_id', v_trade_id)),
        (v_ask.user_id, v_trade_id, 'ASSET_DEBIT', 'KRW', 0, p_item_id, v_match_qty, 'TRADE_SELL', jsonb_build_object('trade_id', v_trade_id)),
        (v_ask.user_id, v_trade_id, 'CASH_CREDIT', 'KRW', ROUND(v_match_qty * COALESCE(v_ask.pk, v_ask.price_usd * v_fx), 0), NULL, 0, 'TRADE_SELL', jsonb_build_object('trade_id', v_trade_id));

      v_matched_count := v_matched_count + 1;
      EXIT;
    END LOOP;
  END LOOP;

  RETURN jsonb_build_object('ok', true, 'matched_count', v_matched_count);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_match_orders(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.rpc_match_orders(uuid) TO authenticated;

-- rpc_place_orderbook_order: insert + match
CREATE OR REPLACE FUNCTION public.rpc_place_orderbook_order(
  p_user_id uuid,
  p_item_id uuid,
  p_side text,
  p_price_usd numeric,
  p_quantity numeric,
  p_price_krw numeric DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id uuid;
  v_fx numeric := 1350;
  v_match_result jsonb;
BEGIN
  IF p_side NOT IN ('bid', 'ask') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INVALID_SIDE');
  END IF;
  IF p_quantity <= 0 OR p_price_usd <= 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INVALID_AMOUNT');
  END IF;

  INSERT INTO orderbook_orders (content_id, user_id, side, price_usd, quantity, filled_quantity, remaining_quantity, status, price_krw)
  VALUES (p_item_id, p_user_id, p_side, p_price_usd, p_quantity, 0, p_quantity, 'open', COALESCE(p_price_krw, ROUND(p_price_usd * v_fx, 0)))
  RETURNING id INTO v_order_id;

  SELECT rpc_match_orders(p_item_id) INTO v_match_result;

  RETURN jsonb_build_object('ok', true, 'order_id', v_order_id, 'match_result', v_match_result);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_place_orderbook_order(uuid, uuid, text, numeric, numeric, numeric) TO service_role;
GRANT EXECUTE ON FUNCTION public.rpc_place_orderbook_order(uuid, uuid, text, numeric, numeric, numeric) TO authenticated;

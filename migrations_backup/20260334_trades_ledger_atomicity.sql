-- PHASE 1: trades + ledger 원자성, 멱등성
-- trades unique, ledger trade_id metadata unique

-- trades: bid_order_id + ask_order_id + price + quantity unique
CREATE UNIQUE INDEX IF NOT EXISTS idx_trades_idempotency
  ON public.trades (bid_order_id, ask_order_id, price_usd, quantity)
  WHERE bid_order_id IS NOT NULL AND ask_order_id IS NOT NULL;

-- ledger_entries: (user_id, entry_type, memo, trade_id) unique for idempotency
CREATE UNIQUE INDEX IF NOT EXISTS idx_ledger_trade_idempotency
  ON public.ledger_entries (user_id, entry_type, memo, ((metadata->>'trade_id')))
  WHERE metadata->>'trade_id' IS NOT NULL AND metadata->>'trade_id' != '';

-- rpc_match_orders: 원자성 + 멱등성 (1회 최대 5건)
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
  v_fx numeric := 1350;
  v_trade_id uuid;
  v_matched_count int := 0;
  v_price_krw numeric;
  v_inserted boolean;
BEGIN
  FOR v_bid IN
    SELECT id, user_id, quantity, COALESCE(remaining_quantity, quantity - COALESCE(filled_quantity,0)) AS rem, price_usd, COALESCE(price_krw, ROUND(price_usd * 1350, 0)) AS pk
    FROM orderbook_orders
    WHERE content_id = p_item_id AND side = 'bid' AND status IN ('open', 'partial')
      AND COALESCE(remaining_quantity, quantity - COALESCE(filled_quantity,0)) > 0
    ORDER BY price_usd DESC, created_at ASC
    LIMIT 5
  LOOP
    FOR v_ask IN
      SELECT id, user_id, quantity, COALESCE(remaining_quantity, quantity - COALESCE(filled_quantity,0)) AS rem, price_usd, COALESCE(price_krw, ROUND(price_usd * 1350, 0)) AS pk
      FROM orderbook_orders
      WHERE content_id = p_item_id AND side = 'ask' AND status IN ('open', 'partial')
        AND COALESCE(remaining_quantity, quantity - COALESCE(filled_quantity,0)) > 0
        AND price_usd <= v_bid.price_usd
      ORDER BY price_usd ASC, created_at ASC
      LIMIT 5
    LOOP
      v_match_qty := LEAST(v_bid.rem, v_ask.rem);
      IF v_match_qty <= 0 THEN EXIT; END IF;

      v_trade_id := gen_random_uuid();
      v_price_krw := COALESCE(v_ask.pk, ROUND(v_ask.price_usd * v_fx, 0));
      v_inserted := false;

      BEGIN
        INSERT INTO trades (content_id, bid_order_id, ask_order_id, price_usd, price_krw, quantity, buyer_id, seller_id)
        VALUES (p_item_id, v_bid.id, v_ask.id, v_ask.price_usd, v_price_krw, v_match_qty, v_bid.user_id, v_ask.user_id);
        v_inserted := true;
      EXCEPTION WHEN unique_violation THEN
        NULL;
      END;

      IF v_inserted THEN
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

        BEGIN
          INSERT INTO ledger_entries (user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata)
          VALUES
            (v_bid.user_id, v_trade_id, 'ASSET_CREDIT', 'KRW', 0, p_item_id, v_match_qty, 'TRADE_BUY', jsonb_build_object('trade_id', v_trade_id)),
            (v_bid.user_id, v_trade_id, 'CASH_DEBIT', 'KRW', ROUND(v_match_qty * v_price_krw, 0), NULL, 0, 'TRADE_BUY', jsonb_build_object('trade_id', v_trade_id)),
            (v_ask.user_id, v_trade_id, 'ASSET_DEBIT', 'KRW', 0, p_item_id, v_match_qty, 'TRADE_SELL', jsonb_build_object('trade_id', v_trade_id)),
            (v_ask.user_id, v_trade_id, 'CASH_CREDIT', 'KRW', ROUND(v_match_qty * v_price_krw, 0), NULL, 0, 'TRADE_SELL', jsonb_build_object('trade_id', v_trade_id));
        EXCEPTION WHEN unique_violation THEN
          NULL;
        END;

        v_matched_count := v_matched_count + 1;
      END IF;
      EXIT;
    END LOOP;
  END LOOP;

  RETURN jsonb_build_object('ok', true, 'matched_count', v_matched_count);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_match_orders(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.rpc_match_orders(uuid) TO authenticated;

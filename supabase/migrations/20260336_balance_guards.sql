-- PHASE 3: 잔고/보유 검증 - cash_available, asset_available
CREATE OR REPLACE FUNCTION public.fn_cash_available(p_user_id uuid)
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(CASE WHEN entry_type = 'CASH_CREDIT' THEN amount WHEN entry_type = 'CASH_DEBIT' THEN -ABS(amount) ELSE 0 END), 0)
  FROM ledger_entries WHERE user_id = p_user_id;
$$;

CREATE OR REPLACE FUNCTION public.fn_asset_available(p_user_id uuid, p_asset_id uuid)
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(CASE WHEN entry_type = 'ASSET_CREDIT' THEN quantity WHEN entry_type = 'ASSET_DEBIT' THEN -quantity ELSE 0 END), 0)
  FROM ledger_entries WHERE user_id = p_user_id AND asset_id = p_asset_id;
$$;

-- rpc_place_orderbook_order: 사전검증 추가
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
  v_cash numeric;
  v_asset numeric;
  v_required numeric;
BEGIN
  IF p_side NOT IN ('bid', 'ask') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INVALID_SIDE');
  END IF;
  IF p_quantity <= 0 OR p_price_usd <= 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INVALID_AMOUNT');
  END IF;

  v_required := ROUND(p_quantity * COALESCE(p_price_krw, p_price_usd * v_fx), 0);
  v_cash := fn_cash_available(p_user_id);
  v_asset := fn_asset_available(p_user_id, p_item_id);

  IF p_side = 'bid' AND v_cash < v_required THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INSUFFICIENT_FUNDS');
  END IF;
  IF p_side = 'ask' AND v_asset < p_quantity THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INSUFFICIENT_ASSETS');
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

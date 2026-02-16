-- 시뮬레이션 모드 전용: auth 체크 스킵, service_role로 주문 생성
-- NEXT_PUBLIC_SIMULATION_MODE=true 시에만 사용
CREATE OR REPLACE FUNCTION public.rpc_sim_place_orderbook_order(
  p_user_id uuid,
  p_item_id uuid,
  p_side text,
  p_price_usd numeric,
  p_quantity numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id uuid;
  v_match_result jsonb;
  v_fx numeric := 1350;
  v_price_krw numeric;
BEGIN
  PERFORM set_config('app.audit_written', 'on', true);

  IF p_side NOT IN ('bid', 'ask') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INVALID_SIDE');
  END IF;
  IF p_quantity <= 0 OR p_price_usd <= 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INVALID_AMOUNT');
  END IF;

  v_price_krw := ROUND(p_price_usd * v_fx, 0);

  INSERT INTO orderbook_orders (content_id, user_id, side, price_usd, quantity, filled_quantity, remaining_quantity, status, price_krw)
  VALUES (p_item_id, p_user_id, p_side, p_price_usd, p_quantity, 0, p_quantity, 'open', v_price_krw)
  RETURNING id INTO v_order_id;

  PERFORM rpc_write_financial_audit(
    'ORDERBOOK_WRITE',
    'ORDERBOOK_ORDER',
    v_order_id::text,
    jsonb_build_object(
      'sim', true,
      'content_id', p_item_id,
      'side', p_side,
      'price_usd', p_price_usd,
      'quantity', p_quantity,
      'idempotency_key', null
    )
  );

  SELECT rpc_match_orders(p_item_id) INTO v_match_result;

  RETURN jsonb_build_object('ok', true, 'order_id', v_order_id, 'match_result', v_match_result);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_sim_place_orderbook_order(uuid, uuid, text, numeric, numeric) TO service_role;

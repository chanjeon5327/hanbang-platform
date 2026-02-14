-- rpc_invest_and_notify_from_payment: PAYMENT_APPROVED order에 대해 투자 확정
-- advisory lock + 중복 실행 방지

CREATE OR REPLACE FUNCTION public.rpc_invest_and_notify_from_payment(p_payment_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payment record;
  v_order record;
  v_cash_exists boolean;
  v_lock_key bigint;
BEGIN
  SELECT * INTO v_payment FROM payments WHERE id = p_payment_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'PAYMENT_NOT_FOUND';
  END IF;

  SELECT * INTO v_order FROM orders WHERE id = v_payment.order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'ORDER_NOT_FOUND';
  END IF;

  IF v_order.status = 'INVEST_CONFIRMED' THEN
    RETURN jsonb_build_object('ok', true, 'order_id', v_order.id, 'idempotent', true);
  END IF;

  IF v_order.status NOT IN ('PAYMENT_REQUESTED', 'PAYMENT_APPROVED') THEN
    RAISE EXCEPTION 'ORDER_STATUS_INVALID: PAYMENT_REQUESTED/APPROVED 필요, 현재: %', v_order.status::text;
  END IF;

  -- PAYMENT_REQUESTED → PAYMENT_APPROVED (payment가 이미 APPROVED로 업데이트됨)
  IF v_order.status = 'PAYMENT_REQUESTED' THEN
    PERFORM set_config('app.allow_settlement', 'on', true);
    UPDATE orders SET status = 'PAYMENT_APPROVED' WHERE id = v_order.id;
  END IF;

  -- advisory lock (order_id 해시)
  v_lock_key := ('x' || substr(md5(v_order.id::text), 1, 15))::bit(60)::bigint;
  PERFORM pg_advisory_xact_lock(v_lock_key);

  -- 중복 체크
  SELECT EXISTS(SELECT 1 FROM ledger_entries WHERE order_id = v_order.id AND entry_type = 'CASH_DEBIT') INTO v_cash_exists;
  IF v_cash_exists THEN
    PERFORM set_config('app.allow_settlement', 'on', true);
    UPDATE orders SET status = 'INVEST_CONFIRMED', completed_at = now(), ledger_posted_at = now() WHERE id = v_order.id;
    RETURN jsonb_build_object('ok', true, 'order_id', v_order.id, 'idempotent', true);
  END IF;

  PERFORM set_config('app.allow_settlement', 'on', true);

  -- ledger
  INSERT INTO ledger_entries (user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata)
  VALUES (v_payment.user_id, v_order.id, 'CASH_DEBIT', 'KRW', (v_payment.amount * -1), NULL, 0, 'PRODUCT_PURCHASE', '{}'::jsonb);
  INSERT INTO ledger_entries (user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata)
  VALUES (v_payment.user_id, v_order.id, 'ASSET_CREDIT', 'KRW', 0, v_payment.content_id, 1, 'PRODUCT_PURCHASE', '{}'::jsonb);

  -- content_items
  UPDATE content_items SET current_raise = COALESCE(current_raise, 0) + v_payment.amount WHERE id = v_payment.content_id;

  -- notifications
  INSERT INTO notifications (user_id, type, reference_id, message)
  VALUES (v_payment.user_id, 'INVEST_SUCCESS', v_payment.content_id, format('₩%s 투자 완료', to_char(v_payment.amount, 'FM999,999,999')));

  -- order status
  UPDATE orders SET status = 'INVEST_CONFIRMED', completed_at = now(), ledger_posted_at = now() WHERE id = v_order.id;

  RETURN jsonb_build_object('ok', true, 'order_id', v_order.id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_invest_and_notify_from_payment(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.rpc_invest_and_notify_from_payment(uuid) TO authenticated;

-- rpc_invest_and_notify_from_payment: 한도 검증 + INVEST_ENABLED 스위치

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
  v_invest_enabled text;
  v_daily_limit bigint;
  v_monthly_limit bigint;
  v_daily_sum bigint;
  v_monthly_sum bigint;
BEGIN
  -- 1) INVEST_ENABLED 스위치
  SELECT value INTO v_invest_enabled FROM settings WHERE key = 'INVEST_ENABLED' LIMIT 1;
  IF COALESCE(v_invest_enabled, 'true') <> 'true' THEN
    RAISE EXCEPTION 'INVEST_TEMP_DISABLED: 투자가 일시 중지되었습니다.';
  END IF;

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

  -- 2) 투자 한도 검증 (profiles)
  SELECT COALESCE(p.daily_invest_limit, 1000000), COALESCE(p.monthly_invest_limit, 10000000)
  INTO v_daily_limit, v_monthly_limit
  FROM profiles p WHERE p.id = v_payment.user_id;

  SELECT COALESCE(SUM(ABS(amount)), 0) INTO v_daily_sum
  FROM ledger_entries
  WHERE user_id = v_payment.user_id AND entry_type = 'CASH_DEBIT'
    AND created_at >= date_trunc('day', now());

  SELECT COALESCE(SUM(ABS(amount)), 0) INTO v_monthly_sum
  FROM ledger_entries
  WHERE user_id = v_payment.user_id AND entry_type = 'CASH_DEBIT'
    AND created_at >= date_trunc('month', now());

  IF (v_daily_sum + v_payment.amount) > v_daily_limit THEN
    RAISE EXCEPTION 'INVEST_LIMIT_EXCEEDED: 일일 투자 한도(%s) 초과', v_daily_limit;
  END IF;
  IF (v_monthly_sum + v_payment.amount) > v_monthly_limit THEN
    RAISE EXCEPTION 'INVEST_LIMIT_EXCEEDED: 월간 투자 한도(%s) 초과', v_monthly_limit;
  END IF;

  -- PAYMENT_REQUESTED → PAYMENT_APPROVED
  IF v_order.status = 'PAYMENT_REQUESTED' THEN
    PERFORM set_config('app.allow_settlement', 'on', true);
    UPDATE orders SET status = 'PAYMENT_APPROVED' WHERE id = v_order.id;
  END IF;

  v_lock_key := ('x' || substr(md5(v_order.id::text), 1, 15))::bit(60)::bigint;
  PERFORM pg_advisory_xact_lock(v_lock_key);

  SELECT EXISTS(SELECT 1 FROM ledger_entries WHERE order_id = v_order.id AND entry_type = 'CASH_DEBIT') INTO v_cash_exists;
  IF v_cash_exists THEN
    PERFORM set_config('app.allow_settlement', 'on', true);
    UPDATE orders SET status = 'INVEST_CONFIRMED', completed_at = now(), ledger_posted_at = now() WHERE id = v_order.id;
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.user_artist_contribution;
    RETURN jsonb_build_object('ok', true, 'order_id', v_order.id, 'idempotent', true);
  END IF;

  PERFORM set_config('app.allow_settlement', 'on', true);

  INSERT INTO ledger_entries (user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata)
  VALUES (v_payment.user_id, v_order.id, 'CASH_DEBIT', 'KRW', (v_payment.amount * -1), NULL, 0, 'PRODUCT_PURCHASE', '{}'::jsonb);
  INSERT INTO ledger_entries (user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata)
  VALUES (v_payment.user_id, v_order.id, 'ASSET_CREDIT', 'KRW', 0, v_payment.content_id, 1, 'PRODUCT_PURCHASE', '{}'::jsonb);

  UPDATE content_items SET current_raise = COALESCE(current_raise, 0) + v_payment.amount WHERE id = v_payment.content_id;

  INSERT INTO notifications (user_id, type, reference_id, message)
  VALUES (v_payment.user_id, 'INVEST_SUCCESS', v_payment.content_id, format('₩%s 투자 완료', to_char(v_payment.amount, 'FM999,999,999')));

  UPDATE orders SET status = 'INVEST_CONFIRMED', completed_at = now(), ledger_posted_at = now() WHERE id = v_order.id;

  REFRESH MATERIALIZED VIEW CONCURRENTLY public.user_artist_contribution;

  RETURN jsonb_build_object('ok', true, 'order_id', v_order.id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_invest_and_notify_from_payment(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.rpc_invest_and_notify_from_payment(uuid) TO authenticated;

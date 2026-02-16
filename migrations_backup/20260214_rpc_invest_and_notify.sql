-- rpc_invest_and_notify: 투자 성공 시 원자적 처리
-- ledger insert + orders + notifications + content_items.current_raise
-- 프론트는 이 RPC만 호출 (place API에서 호출)

CREATE OR REPLACE FUNCTION public.rpc_invest_and_notify(
  p_user_id uuid,
  p_product_id uuid,
  p_amount_krw numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance numeric;
  v_order_id uuid;
  v_cash_exists boolean;
  v_now timestamptz;
BEGIN
  v_now := now();

  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'FORBIDDEN: 본인만 투자 가능';
  END IF;

  IF p_amount_krw IS NULL OR p_amount_krw <= 0 THEN
    RAISE EXCEPTION 'INVALID_AMOUNT: 투자 금액은 0보다 커야 합니다.';
  END IF;

  -- 잔액 계산 (CASH_CREDIT - abs(CASH_DEBIT))
  SELECT COALESCE(SUM(CASE WHEN entry_type = 'CASH_CREDIT' THEN amount ELSE 0 END), 0)
       - COALESCE(SUM(CASE WHEN entry_type = 'CASH_DEBIT' THEN ABS(amount) ELSE 0 END), 0)
  INTO v_balance
  FROM ledger_entries
  WHERE user_id = p_user_id;

  IF COALESCE(v_balance, 0) < p_amount_krw THEN
    RAISE EXCEPTION 'INSUFFICIENT_FUNDS: 잔액 부족';
  END IF;

  -- 1) orders insert
  INSERT INTO orders (
    user_id, product_id, type, order_type, price, quantity, filled_quantity,
    status, completed_at, ledger_posted_at, total_amount_krw
  ) VALUES (
    p_user_id, p_product_id, 'BUY', 'MARKET', p_amount_krw, 1, 1,
    'COMPLETED', v_now, v_now, p_amount_krw
  )
  RETURNING id INTO v_order_id;

  IF v_order_id IS NULL THEN
    RAISE EXCEPTION 'ORDER_INSERT_FAILED';
  END IF;

  -- 2) ledger: CASH_DEBIT (중복 방지)
  SELECT EXISTS(SELECT 1 FROM ledger_entries WHERE order_id = v_order_id AND entry_type = 'CASH_DEBIT') INTO v_cash_exists;
  IF NOT v_cash_exists THEN
    INSERT INTO ledger_entries (user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata)
    VALUES (p_user_id, v_order_id, 'CASH_DEBIT', 'KRW', (p_amount_krw * -1), NULL, 0, 'PRODUCT_PURCHASE', '{}'::jsonb);
    INSERT INTO ledger_entries (user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata)
    VALUES (p_user_id, v_order_id, 'ASSET_CREDIT', 'KRW', 0, p_product_id, 1, 'PRODUCT_PURCHASE', '{}'::jsonb);
  END IF;

  -- 3) content_items.current_raise 갱신 (존재 시)
  UPDATE content_items
  SET current_raise = COALESCE(current_raise, 0) + p_amount_krw
  WHERE id = p_product_id;

  -- 4) notifications insert
  INSERT INTO notifications (user_id, type, reference_id, message)
  VALUES (
    p_user_id,
    'INVEST_SUCCESS',
    p_product_id,
    format('₩%s 투자 완료', to_char(p_amount_krw, 'FM999,999,999'))
  );

  RETURN jsonb_build_object('ok', true, 'order_id', v_order_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_invest_and_notify(uuid, uuid, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_invest_and_notify(uuid, uuid, numeric) TO service_role;

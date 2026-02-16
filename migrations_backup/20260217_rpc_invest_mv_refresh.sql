-- rpc_invest_and_notify: MV 갱신 추가 (orders/place 플로우용)

CREATE OR REPLACE FUNCTION public.rpc_invest_and_notify(
  p_user_id uuid,
  p_content_id uuid,
  p_amount_krw numeric,
  p_idempotency_key text DEFAULT NULL
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
  v_product_id uuid;
BEGIN
  v_now := now();

  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'FORBIDDEN: 본인만 투자 가능';
  END IF;

  IF p_amount_krw IS NULL OR p_amount_krw <= 0 THEN
    RAISE EXCEPTION 'INVALID_AMOUNT: 투자 금액은 0보다 커야 합니다.';
  END IF;

  -- idempotency: 동일 키로 이미 주문 존재 시 반환
  IF p_idempotency_key IS NOT NULL AND p_idempotency_key <> '' THEN
    SELECT id INTO v_order_id
    FROM orders
    WHERE idempotency_key = p_idempotency_key AND user_id = p_user_id
    LIMIT 1;
    IF FOUND THEN
      RETURN jsonb_build_object('ok', true, 'order_id', v_order_id, 'idempotent', true);
    END IF;
  END IF;

  -- product_id: products.content_id = p_content_id 인 row (있을 경우)
  SELECT id INTO v_product_id FROM products WHERE content_id = p_content_id LIMIT 1;

  -- 잔액 계산
  SELECT COALESCE(SUM(CASE WHEN entry_type = 'CASH_CREDIT' THEN amount ELSE 0 END), 0)
       - COALESCE(SUM(CASE WHEN entry_type = 'CASH_DEBIT' THEN ABS(amount) ELSE 0 END), 0)
  INTO v_balance
  FROM ledger_entries
  WHERE user_id = p_user_id;

  IF COALESCE(v_balance, 0) < p_amount_krw THEN
    RAISE EXCEPTION 'INSUFFICIENT_FUNDS: 잔액 부족';
  END IF;

  -- 1) orders insert (content_id 기준, product_id 병행)
  INSERT INTO orders (
    user_id, content_id, product_id, type, order_type, price, quantity, filled_quantity,
    status, completed_at, ledger_posted_at, total_amount_krw, idempotency_key
  ) VALUES (
    p_user_id, p_content_id, v_product_id, 'BUY', 'MARKET', p_amount_krw, 1, 1,
    'COMPLETED', v_now, v_now, p_amount_krw,
    CASE WHEN p_idempotency_key IS NOT NULL AND TRIM(p_idempotency_key) <> '' THEN TRIM(p_idempotency_key) ELSE NULL END
  )
  RETURNING id INTO v_order_id;

  IF v_order_id IS NULL THEN
    RAISE EXCEPTION 'ORDER_INSERT_FAILED';
  END IF;

  -- 2) ledger (asset_id = content_id)
  SELECT EXISTS(SELECT 1 FROM ledger_entries WHERE order_id = v_order_id AND entry_type = 'CASH_DEBIT') INTO v_cash_exists;
  IF NOT v_cash_exists THEN
    INSERT INTO ledger_entries (user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata)
    VALUES (p_user_id, v_order_id, 'CASH_DEBIT', 'KRW', (p_amount_krw * -1), NULL, 0, 'PRODUCT_PURCHASE', '{}'::jsonb);
    INSERT INTO ledger_entries (user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata)
    VALUES (p_user_id, v_order_id, 'ASSET_CREDIT', 'KRW', 0, p_content_id, 1, 'PRODUCT_PURCHASE', '{}'::jsonb);
  END IF;

  -- 3) content_items.current_raise
  UPDATE content_items
  SET current_raise = COALESCE(current_raise, 0) + p_amount_krw
  WHERE id = p_content_id;

  -- 4) notifications (reference_id = content_id)
  INSERT INTO notifications (user_id, type, reference_id, message)
  VALUES (
    p_user_id,
    'INVEST_SUCCESS',
    p_content_id,
    format('₩%s 투자 완료', to_char(p_amount_krw, 'FM999,999,999'))
  );

  REFRESH MATERIALIZED VIEW CONCURRENTLY public.user_artist_contribution;

  RETURN jsonb_build_object('ok', true, 'order_id', v_order_id);
END;
$$;

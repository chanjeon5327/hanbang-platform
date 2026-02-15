-- rpc_sell_content: 부분 매도 (ASSET_DEBIT + CASH_CREDIT)
-- 입력: p_user_id, p_content_id, p_quantity (매도 수량)

CREATE OR REPLACE FUNCTION public.rpc_sell_content(
  p_user_id uuid,
  p_content_id uuid,
  p_quantity numeric,
  p_idempotency_key text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_position numeric;
  v_share_price_usd numeric;
  v_fx_rate numeric := 1350;
  v_sell_amount_krw numeric;
  v_order_id uuid;
  v_asset_exists boolean;
  v_product_id uuid;
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'FORBIDDEN: 본인만 매도 가능';
  END IF;

  IF p_quantity IS NULL OR p_quantity <= 0 THEN
    RAISE EXCEPTION 'INVALID_QUANTITY: 매도 수량은 0보다 커야 합니다.';
  END IF;

  -- 보유 수량 확인 (ASSET_CREDIT - ASSET_DEBIT)
  SELECT COALESCE(SUM(CASE WHEN entry_type = 'ASSET_CREDIT' THEN quantity ELSE -quantity END), 0)
  INTO v_position
  FROM ledger_entries
  WHERE user_id = p_user_id AND asset_id = p_content_id;

  IF COALESCE(v_position, 0) < p_quantity THEN
    RAISE EXCEPTION 'INSUFFICIENT_ASSETS: 보유 수량이 부족합니다.';
  END IF;

  -- 주당 가격 (USD)
  SELECT share_price_usd INTO v_share_price_usd
  FROM content_items WHERE id = p_content_id;
  v_share_price_usd := COALESCE(v_share_price_usd, 0);
  IF v_share_price_usd <= 0 THEN
    RAISE EXCEPTION 'PRICE_UNAVAILABLE: 해당 자산의 시세를 조회할 수 없습니다.';
  END IF;

  v_sell_amount_krw := ROUND(p_quantity * v_share_price_usd * v_fx_rate);

  -- product_id (있을 경우)
  SELECT id INTO v_product_id FROM products WHERE content_id = p_content_id LIMIT 1;

  -- idempotency
  IF p_idempotency_key IS NOT NULL AND TRIM(p_idempotency_key) <> '' THEN
    SELECT id INTO v_order_id FROM orders
    WHERE idempotency_key = TRIM(p_idempotency_key) AND user_id = p_user_id LIMIT 1;
    IF FOUND THEN
      RETURN jsonb_build_object('ok', true, 'order_id', v_order_id, 'idempotent', true);
    END IF;
  END IF;

  -- 1) orders insert (type SELL)
  INSERT INTO orders (
    user_id, content_id, product_id, type, order_type, price, quantity, filled_quantity,
    status, completed_at, ledger_posted_at, total_amount_krw, idempotency_key
  ) VALUES (
    p_user_id, p_content_id, v_product_id, 'SELL', 'MARKET', v_share_price_usd * v_fx_rate, p_quantity, p_quantity,
    'COMPLETED', now(), now(), v_sell_amount_krw,
    CASE WHEN p_idempotency_key IS NOT NULL AND TRIM(p_idempotency_key) <> '' THEN TRIM(p_idempotency_key) ELSE NULL END
  )
  RETURNING id INTO v_order_id;

  IF v_order_id IS NULL THEN
    RAISE EXCEPTION 'ORDER_INSERT_FAILED';
  END IF;

  -- 2) ledger: ASSET_DEBIT + CASH_CREDIT
  SELECT EXISTS(SELECT 1 FROM ledger_entries WHERE order_id = v_order_id AND entry_type = 'ASSET_DEBIT') INTO v_asset_exists;
  IF NOT v_asset_exists THEN
    INSERT INTO ledger_entries (user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata)
    VALUES (p_user_id, v_order_id, 'ASSET_DEBIT', 'KRW', 0, p_content_id, p_quantity, 'PRODUCT_SELL', '{}'::jsonb);
    INSERT INTO ledger_entries (user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata)
    VALUES (p_user_id, v_order_id, 'CASH_CREDIT', 'KRW', v_sell_amount_krw, NULL, 0, 'PRODUCT_SELL', '{}'::jsonb);
  END IF;

  -- 3) notifications
  INSERT INTO notifications (user_id, type, reference_id, message)
  VALUES (p_user_id, 'INVEST_SUCCESS', p_content_id, format('₩%s 매도 완료', to_char(v_sell_amount_krw, 'FM999,999,999')));

  RETURN jsonb_build_object('ok', true, 'order_id', v_order_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_sell_content(uuid, uuid, numeric, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_sell_content(uuid, uuid, numeric, text) TO service_role;

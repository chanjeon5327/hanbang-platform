-- rpc_invest: 모바일 투자 (MobileProductDetail)
-- SECURITY DEFINER, search_path, GRANT 포함
-- 기존 supabase/rpc/rpc_invest.sql → migrations로 편입

CREATE OR REPLACE FUNCTION public.rpc_invest(
  p_product_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_price numeric;
  v_remaining numeric;
  v_order_id uuid;
BEGIN
  -- 1) 로그인 사용자 확인
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED';
  END IF;

  -- 2) 상품 잠금 조회
  SELECT p.price, p.remaining_quantity
  INTO v_price, v_remaining
  FROM products p
  WHERE p.id = p_product_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'PRODUCT_NOT_FOUND';
  END IF;

  IF v_remaining IS NULL OR v_remaining <= 0 THEN
    RAISE EXCEPTION 'SOLD_OUT';
  END IF;

  -- 3) 주문 생성 (orders: price, quantity, order_type, type, user_id)
  INSERT INTO orders (
    user_id,
    product_id,
    price,
    quantity,
    filled_quantity,
    status,
    order_type,
    type,
    completed_at,
    ledger_posted_at
  ) VALUES (
    v_user_id,
    p_product_id,
    v_price,
    1,
    1,
    'COMPLETED',
    'MARKET',
    'BUY',
    now(),
    now()
  )
  RETURNING id INTO v_order_id;

  -- 4) 구매자 원장: 현금 차감 (ledger_entries 스키마 정합)
  INSERT INTO ledger_entries (
    user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata
  ) VALUES (
    v_user_id, v_order_id, 'CASH_DEBIT', 'KRW', (v_price * -1), NULL, 0,
    'rpc_invest: PRODUCT_PURCHASE', '{}'::jsonb
  );

  -- 5) 구매자 원장: 자산 취득
  INSERT INTO ledger_entries (
    user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata
  ) VALUES (
    v_user_id, v_order_id, 'ASSET_CREDIT', 'KRW', 0, p_product_id, 1,
    'rpc_invest: PRODUCT_PURCHASE', '{}'::jsonb
  );

  -- 6) 상품 잔여 수량 감소
  UPDATE products
  SET
    remaining_quantity = remaining_quantity - 1,
    status = CASE WHEN remaining_quantity - 1 <= 0 THEN 'ended' ELSE status END
  WHERE id = p_product_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_invest(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_invest(uuid) TO service_role;

-- =============================================================================
-- 테스트 쿼리 (impersonate authenticated)
-- =============================================================================
-- [방법 1] Supabase Studio SQL Editor - "Run as user" 사용 (Impersonation)
--   1) SQL Editor 열기
--   2) 우측 "Run as user"에서 테스트할 사용자 선택
--   3) 아래 쿼리 실행 (PRODUCT_UUID_HERE를 실제 product_id로 교체)
--
--   select public.rpc_invest('PRODUCT_UUID_HERE'::uuid);
--
-- [방법 2] REST API (Authorization: Bearer <user_jwt>)
--   POST {SUPABASE_URL}/rest/v1/rpc/rpc_invest
--   Headers: { "Authorization": "Bearer <user_jwt>", "Content-Type": "application/json" }
--   Body: {"p_product_id": "PRODUCT_UUID_HERE"}
--
-- [방법 3] JS 클라이언트
--   const { error } = await supabase.rpc('rpc_invest', { p_product_id: productId });

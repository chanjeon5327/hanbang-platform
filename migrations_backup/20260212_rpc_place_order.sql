-- supabase/migrations/20260212_rpc_place_order.sql
-- RPC: 주문 생성 (auth.uid() 검증 + orders insert)
-- Ledger-first: 주문은 'created' 상태로 insert, 체결/원장은 별도 플로우

BEGIN;

CREATE OR REPLACE FUNCTION public.rpc_place_order(
  p_product_id uuid,
  p_side text DEFAULT 'BUY',
  p_price numeric DEFAULT 0,
  p_quantity numeric DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_buyer_id uuid;
  v_order_id uuid;
  v_total numeric;
BEGIN
  -- 1) 권한 검증: 로그인 필요
  v_buyer_id := auth.uid();
  IF v_buyer_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: 로그인이 필요합니다.';
  END IF;

  -- 2) 수량/가격 검증
  IF p_quantity IS NULL OR p_quantity <= 0 THEN
    RAISE EXCEPTION '수량은 1 이상이어야 합니다.';
  END IF;
  IF p_price IS NULL OR p_price < 0 THEN
    RAISE EXCEPTION '가격이 올바르지 않습니다.';
  END IF;

  -- 3) 상품 존재 검증
  IF NOT EXISTS (SELECT 1 FROM public.products WHERE id = p_product_id) THEN
    RAISE EXCEPTION '존재하지 않는 상품입니다.';
  END IF;

  -- 4) 매도는 미지원 (1단계: 매수만)
  IF p_side IS DISTINCT FROM 'BUY' THEN
    RAISE EXCEPTION '현재 매수만 지원합니다.';
  END IF;

  -- 5) 총액 계산
  v_total := p_price * p_quantity;

  -- 6) 주문 insert
  INSERT INTO public.orders (
    buyer_id,
    product_id,
    status,
    total_amount_krw,
    quantity,
    metadata
  ) VALUES (
    v_buyer_id,
    p_product_id,
    'created',
    v_total,
    p_quantity,
    jsonb_build_object('side', p_side, 'price_per_unit', p_price)
  )
  RETURNING id INTO v_order_id;

  RETURN jsonb_build_object(
    'id', v_order_id,
    'status', 'created',
    'total_amount_krw', v_total,
    'quantity', p_quantity
  );
END;
$$;

-- RLS/권한
GRANT EXECUTE ON FUNCTION public.rpc_place_order(uuid, text, numeric, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_place_order(uuid, text, numeric, numeric) TO service_role;

COMMIT;

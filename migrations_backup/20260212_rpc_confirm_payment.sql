-- supabase/migrations/20260212_rpc_confirm_payment.sql
-- RPC: PG 결제 콜백 검증 후 주문 상태 전이 (created → completed)
-- 원장: completed 전이 시 tg_post_ledger_on_order_completed 트리거가 자동 기록
-- PG 심사: 금액 매칭, 중복 콜백 방지(idempotent)

BEGIN;

-- orders에 결제 추적 컬럼 추가 (PG 증빙용)
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS paid_at timestamptz,
  ADD COLUMN IF NOT EXISTS transaction_id text,
  ADD COLUMN IF NOT EXISTS payment_method text;

CREATE OR REPLACE FUNCTION public.rpc_confirm_payment(
  p_order_id uuid,
  p_amount_krw numeric,
  p_transaction_id text DEFAULT NULL,
  p_payment_method text DEFAULT 'card'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.orders%ROWTYPE;
BEGIN
  -- 1) 주문 존재 확인
  SELECT * INTO v_row FROM public.orders WHERE id = p_order_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'ORDER_NOT_FOUND: 주문을 찾을 수 없습니다.';
  END IF;

  -- 2) 중복 콜백 방지 (이미 paid/completed면 성공 반환)
  IF v_row.status IN ('paid', 'completed') THEN
    RETURN jsonb_build_object(
      'ok', true,
      'order_id', p_order_id,
      'status', v_row.status,
      'idempotent', true
    );
  END IF;

  -- 3) 전이 가능 상태만 허용
  IF v_row.status NOT IN ('created', 'pending') THEN
    RAISE EXCEPTION 'INVALID_STATUS: 현재 상태(%)에서는 결제 확정이 불가합니다.', v_row.status::text;
  END IF;

  -- 4) 금액 매칭 검증 (PG 심사 핵심)
  IF ABS(COALESCE(v_row.total_amount_krw, 0) - p_amount_krw) > 0.01 THEN
    RAISE EXCEPTION 'AMOUNT_MISMATCH: 주문금액(%)과 결제금액(%)이 일치하지 않습니다.',
      v_row.total_amount_krw, p_amount_krw;
  END IF;

  -- 5) completed로 전이 (원장 트리거 자동 실행)
  UPDATE public.orders
  SET
    status = 'completed',
    paid_at = COALESCE(paid_at, now()),
    transaction_id = COALESCE(transaction_id, p_transaction_id),
    payment_method = COALESCE(payment_method, p_payment_method),
    completed_at = COALESCE(completed_at, now()),
    metadata = jsonb_set(
      COALESCE(metadata, '{}'::jsonb),
      '{pg_callback}',
      jsonb_build_object(
        'transaction_id', p_transaction_id,
        'confirmed_at', now()
      )
    )
  WHERE id = p_order_id;

  RETURN jsonb_build_object(
    'ok', true,
    'order_id', p_order_id,
    'status', 'completed'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_confirm_payment(uuid, numeric, text, text) TO service_role;

COMMIT;

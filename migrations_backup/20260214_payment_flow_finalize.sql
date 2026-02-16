-- ============================================================
-- 결제 상태전이 로직 수정
-- 목표: PG 승인 시 PAID, 원장 반영 성공 후에만 COMPLETED
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 1) rpc_confirm_payment: PENDING → PAID
-- ------------------------------------------------------------

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
  SELECT * INTO v_row FROM public.orders WHERE id = p_order_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'ORDER_NOT_FOUND: 주문을 찾을 수 없습니다.';
  END IF;

  IF v_row.status IN ('PAID', 'COMPLETED') THEN
    RETURN jsonb_build_object('ok', true, 'order_id', p_order_id, 'status', v_row.status, 'idempotent', true);
  END IF;

  IF v_row.status NOT IN ('PENDING') THEN
    RAISE EXCEPTION 'INVALID_STATUS: 현재 상태(%)에서는 결제 확정이 불가합니다.', v_row.status::text;
  END IF;

  IF ABS(COALESCE(v_row.total_amount_krw, 0) - p_amount_krw) > 0.01 THEN
    RAISE EXCEPTION 'AMOUNT_MISMATCH: 주문금액(%)과 결제금액(%)이 일치하지 않습니다.',
      v_row.total_amount_krw, p_amount_krw;
  END IF;

  -- PENDING → PAID (PG 승인 시 반드시 PAID로만 변경)
  UPDATE public.orders
  SET
    status = 'PAID',
    paid_at = COALESCE(paid_at, now()),
    transaction_id = COALESCE(transaction_id, p_transaction_id),
    payment_method = COALESCE(payment_method, p_payment_method),
    metadata = jsonb_set(
      COALESCE(metadata, '{}'::jsonb),
      '{pg_callback}',
      jsonb_build_object('transaction_id', p_transaction_id, 'confirmed_at', now())
    )
  WHERE id = p_order_id;

  RETURN jsonb_build_object('ok', true, 'order_id', p_order_id, 'status', 'PAID');
END;
$$;

-- ------------------------------------------------------------
-- 2) 트리거 제거 + rpc_finalize_order 생성
-- ------------------------------------------------------------

DROP TRIGGER IF EXISTS post_ledger_on_order_completed ON public.orders;
DROP FUNCTION IF EXISTS public.tg_post_ledger_on_order_completed();

CREATE OR REPLACE FUNCTION public.rpc_finalize_order(p_order_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.orders%ROWTYPE;
  v_user uuid;
  v_asset uuid;
  v_cash numeric(18,2);
  v_qty numeric(18,6);
  v_status_text text := 'COMPLETED';
BEGIN
  -- 1) 주문 존재 및 status = PAID 확인
  SELECT * INTO v_row FROM public.orders WHERE id = p_order_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'ORDER_NOT_FOUND: 주문을 찾을 수 없습니다.';
  END IF;

  IF v_row.status != 'PAID' THEN
    RAISE EXCEPTION 'INVALID_STATUS: 원장 반영은 PAID 상태에서만 가능합니다. 현재: %', v_row.status::text;
  END IF;

  -- 2) ledger_entries 멱등 체크
  IF EXISTS (
    SELECT 1 FROM public.ledger_entries
    WHERE order_id = p_order_id AND entry_type = 'CASH_DEBIT'
  ) THEN
    RETURN jsonb_build_object(
      'ok', true, 'order_id', p_order_id, 'status', 'COMPLETED', 'idempotent', true
    );
  END IF;

  -- 3) 원장 반영
  v_user := v_row.buyer_id;
  v_asset := coalesce(v_row.product_id, (v_row.metadata->>'asset_id')::uuid);
  v_cash := coalesce(v_row.total_amount_krw, 0);
  v_qty  := coalesce(v_row.quantity, 0);

  INSERT INTO public.ledger_entries (
    user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata
  ) VALUES (
    v_user, p_order_id, 'CASH_DEBIT', 'KRW', (v_cash * -1), null, 0,
    'Order completed: cash debit',
    jsonb_build_object('source', 'order', 'status', v_status_text)
  );

  INSERT INTO public.ledger_entries (
    user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata
  ) VALUES (
    v_user, p_order_id, 'ASSET_CREDIT', 'KRW', 0, v_asset, v_qty,
    'Order completed: asset credit',
    jsonb_build_object('source', 'order', 'status', v_status_text)
  );

  -- 4) 성공 시 order.status → COMPLETED
  UPDATE public.orders
  SET
    status = 'COMPLETED',
    completed_at = COALESCE(completed_at, now()),
    ledger_posted_at = now()
  WHERE id = p_order_id;

  RETURN jsonb_build_object('ok', true, 'order_id', p_order_id, 'status', 'COMPLETED');
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_finalize_order(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_finalize_order(uuid) TO service_role;

-- ------------------------------------------------------------
-- 3) transition_order_status 전이 규칙 갱신
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.transition_order_status(
  _order_id uuid,
  _next_status order_status
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_status order_status;
BEGIN
  SELECT status INTO current_status FROM public.orders WHERE id = _order_id;
  IF current_status IS NULL THEN
    RAISE EXCEPTION 'ORDER_NOT_FOUND';
  END IF;

  -- PENDING → PAID
  IF current_status = 'PENDING' AND _next_status = 'PAID' THEN NULL;
  -- PENDING → CANCELLED
  ELSIF current_status = 'PENDING' AND _next_status = 'CANCELLED' THEN NULL;
  -- PAID → COMPLETED
  ELSIF current_status = 'PAID' AND _next_status = 'COMPLETED' THEN NULL;
  -- PAID → REFUNDED (관리자 환불)
  ELSIF current_status = 'PAID' AND _next_status = 'REFUNDED' THEN NULL;
  -- COMPLETED → SETTLED
  ELSIF current_status = 'COMPLETED' AND _next_status = 'SETTLED' THEN NULL;
  -- COMPLETED → REFUNDED
  ELSIF current_status = 'COMPLETED' AND _next_status = 'REFUNDED' THEN NULL;
  ELSE
    RAISE EXCEPTION 'INVALID_STATUS_TRANSITION: % -> %', current_status, _next_status;
  END IF;

  UPDATE public.orders SET status = _next_status WHERE id = _order_id;
END;
$$;

COMMIT;

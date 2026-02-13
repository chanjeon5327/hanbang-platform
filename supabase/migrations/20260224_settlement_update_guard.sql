-- ============================================================
-- 정산 RPC에서만 상태 변경 허용 강제
-- - orders, settlement_batches: authenticated/anon UPDATE/DELETE 금지
-- - app.allow_settlement 플래그: RPC 내부에서만 설정, 트리거로 검증
-- - 정산 확정 RPC: advisory lock으로 경쟁 조건 방지
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 1) app.allow_settlement 트리거: 플래그 없으면 UPDATE 차단
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_settlement_flag()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF current_setting('app.allow_settlement', true) IS DISTINCT FROM 'on' THEN
    RAISE EXCEPTION 'SETTLEMENT_UPDATE_FORBIDDEN: 정산/주문 상태 변경은 RPC를 통해서만 가능합니다.';
  END IF;
  RETURN NEW;
END;
$$;

-- orders: UPDATE 시 플래그 검증
DROP TRIGGER IF EXISTS trg_orders_settlement_flag ON public.orders;
CREATE TRIGGER trg_orders_settlement_flag
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.check_settlement_flag();

-- settlement_batches: UPDATE 시 플래그 검증
DROP TRIGGER IF EXISTS trg_settlement_batches_settlement_flag ON public.settlement_batches;
CREATE TRIGGER trg_settlement_batches_settlement_flag
  BEFORE UPDATE ON public.settlement_batches
  FOR EACH ROW
  EXECUTE FUNCTION public.check_settlement_flag();

-- ------------------------------------------------------------
-- 2) RPC 수정: 진입 시 set_config('app.allow_settlement','on',true)
-- ------------------------------------------------------------

-- rpc_confirm_payment
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
  PERFORM set_config('app.allow_settlement', 'on', true);

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

-- rpc_finalize_order
CREATE OR REPLACE FUNCTION public.rpc_finalize_order(p_order_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order record;
  v_cash_exists boolean;
  v_asset_exists boolean;
  v_user uuid;
  v_cash numeric(18,2);
  v_qty numeric(18,6);
  v_asset uuid;
BEGIN
  PERFORM set_config('app.allow_settlement', 'on', true);

  SELECT * INTO v_order FROM orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'ORDER_NOT_FOUND'; END IF;
  IF v_order.status <> 'PAID' THEN RAISE EXCEPTION 'ORDER_NOT_PAID'; END IF;

  SELECT EXISTS(SELECT 1 FROM ledger_entries WHERE order_id = p_order_id AND entry_type = 'CASH_DEBIT') INTO v_cash_exists;
  SELECT EXISTS(SELECT 1 FROM ledger_entries WHERE order_id = p_order_id AND entry_type = 'ASSET_CREDIT') INTO v_asset_exists;
  IF v_cash_exists OR v_asset_exists THEN
    RETURN jsonb_build_object('ok', true, 'order_id', p_order_id, 'status', 'COMPLETED', 'idempotent', true);
  END IF;

  v_user := v_order.buyer_id;
  v_cash := coalesce(v_order.total_amount_krw, 0);
  v_qty := coalesce(v_order.quantity, 0);
  v_asset := coalesce(v_order.product_id, (v_order.metadata->>'asset_id')::uuid);

  INSERT INTO ledger_entries (user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata)
  VALUES (v_user, p_order_id, 'CASH_DEBIT', 'KRW', (v_cash * -1), null, 0, 'Order completed: cash debit', '{}'::jsonb);
  INSERT INTO ledger_entries (user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata)
  VALUES (v_user, p_order_id, 'ASSET_CREDIT', 'KRW', 0, v_asset, v_qty, 'Order completed: asset credit', '{}'::jsonb);

  UPDATE orders SET status = 'COMPLETED', completed_at = coalesce(completed_at, now()), ledger_posted_at = now() WHERE id = p_order_id;
  RETURN jsonb_build_object('ok', true);
END;
$$;

-- rpc_admin_confirm_settlement: advisory lock + 플래그
CREATE OR REPLACE FUNCTION public.rpc_admin_confirm_settlement(p_batch_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.settlement_batches%ROWTYPE;
  v_lock_key bigint;
BEGIN
  v_lock_key := hashtext('settlement:' || p_batch_id::text);
  PERFORM pg_advisory_xact_lock(v_lock_key);

  PERFORM set_config('app.allow_settlement', 'on', true);

  SELECT * INTO v_row FROM public.settlement_batches WHERE id = p_batch_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'SETTLEMENT_BATCH_NOT_FOUND: 정산 배치를 찾을 수 없습니다.';
  END IF;

  IF v_row.confirmed_at IS NOT NULL THEN
    RETURN jsonb_build_object('ok', true, 'idempotent', true, 'confirmed_at', v_row.confirmed_at);
  END IF;

  UPDATE public.settlement_batches SET confirmed_at = now() WHERE id = p_batch_id AND confirmed_at IS NULL;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', true, 'idempotent', true);
  END IF;

  RETURN jsonb_build_object('ok', true, 'confirmed_at', now());
END;
$$;

-- transition_order_status (사용 시)
CREATE OR REPLACE FUNCTION public.transition_order_status(_order_id uuid, _next_status order_status)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_status order_status;
BEGIN
  PERFORM set_config('app.allow_settlement', 'on', true);

  SELECT status INTO current_status FROM public.orders WHERE id = _order_id;
  IF current_status IS NULL THEN RAISE EXCEPTION 'ORDER_NOT_FOUND'; END IF;

  IF current_status = 'PENDING' AND _next_status = 'PAID' THEN NULL;
  ELSIF current_status = 'PENDING' AND _next_status = 'CANCELLED' THEN NULL;
  ELSIF current_status = 'PAID' AND _next_status = 'COMPLETED' THEN NULL;
  ELSIF current_status = 'PAID' AND _next_status = 'REFUNDED' THEN NULL;
  ELSIF current_status = 'COMPLETED' AND _next_status = 'SETTLED' THEN NULL;
  ELSIF current_status = 'COMPLETED' AND _next_status = 'REFUNDED' THEN NULL;
  ELSE
    RAISE EXCEPTION 'INVALID_STATUS_TRANSITION: % -> %', current_status, _next_status;
  END IF;

  UPDATE public.orders SET status = _next_status WHERE id = _order_id;
END;
$$;

-- ------------------------------------------------------------
-- 3) GRANT/REVOKE: authenticated/anon 쓰기 차단
-- ------------------------------------------------------------
REVOKE UPDATE ON TABLE public.orders FROM anon;
REVOKE UPDATE ON TABLE public.orders FROM authenticated;
REVOKE DELETE ON TABLE public.orders FROM anon;
REVOKE DELETE ON TABLE public.orders FROM authenticated;

REVOKE UPDATE ON TABLE public.settlement_batches FROM anon;
REVOKE UPDATE ON TABLE public.settlement_batches FROM authenticated;
REVOKE DELETE ON TABLE public.settlement_batches FROM anon;
REVOKE DELETE ON TABLE public.settlement_batches FROM authenticated;

-- ------------------------------------------------------------
-- 4) settlement_batches RLS: 관리자만 SELECT
-- ------------------------------------------------------------
ALTER TABLE public.settlement_batches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "settlement_batches_admin_select" ON public.settlement_batches;
CREATE POLICY "settlement_batches_admin_select"
  ON public.settlement_batches FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN')
  );

GRANT SELECT ON TABLE public.settlement_batches TO authenticated;
REVOKE SELECT ON TABLE public.settlement_batches FROM anon;

-- ------------------------------------------------------------
-- 5) orders UPDATE 정책 제거 (REVOKE로 차단, RPC만 가능)
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "only system or admin can change order status" ON public.orders;

COMMIT;

-- ============================================================
-- 테스트 체크리스트 (6개)
-- ============================================================
-- [성공 1] rpc_confirm_payment → orders.status PAID 변경 성공
-- [성공 2] rpc_finalize_order → orders COMPLETED + ledger_entries 2건 INSERT 성공
-- [성공 3] rpc_admin_confirm_settlement → settlement_batches.confirmed_at 설정 성공
-- [실패 4] authenticated 클라이언트로 orders UPDATE 시도 → permission denied
-- [실패 5] authenticated 클라이언트로 settlement_batches UPDATE 시도 → permission denied
-- [실패 6] service_role으로 set_config 없이 orders UPDATE 시도 → SETTLEMENT_UPDATE_FORBIDDEN (트리거)

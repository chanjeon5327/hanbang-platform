-- rpc_admin_confirm_settlement: confirmed_at 업데이트 후 ledger_entries.ledger_posted_at 봉인
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

  -- 정산 확정 시 해당 배치 주문의 ledger_entries.ledger_posted_at 봉인
  UPDATE public.ledger_entries
  SET ledger_posted_at = now()
  WHERE order_id IN (
    SELECT id FROM public.orders
    WHERE settlement_batch_id = p_batch_id
  )
  AND ledger_posted_at IS NULL;

  RETURN jsonb_build_object('ok', true, 'confirmed_at', now());
END;
$$;

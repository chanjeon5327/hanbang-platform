-- settlement_batches + rpc_admin_confirm_settlement (idempotent)
CREATE TABLE IF NOT EXISTS public.settlement_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  settlement_date date NOT NULL UNIQUE,
  order_count integer NOT NULL DEFAULT 0,
  net_amount numeric(18,2) NOT NULL DEFAULT 0,
  confirmed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_settlement_batches_date ON public.settlement_batches(settlement_date DESC);
CREATE INDEX IF NOT EXISTS idx_settlement_batches_confirmed ON public.settlement_batches(confirmed_at);

-- RPC: 정산 확정 (idempotent, 2중 클릭 방지)
CREATE OR REPLACE FUNCTION public.rpc_admin_confirm_settlement(p_batch_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.settlement_batches%ROWTYPE;
BEGIN
  SELECT * INTO v_row FROM public.settlement_batches WHERE id = p_batch_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'SETTLEMENT_BATCH_NOT_FOUND: 정산 배치를 찾을 수 없습니다.';
  END IF;

  IF v_row.confirmed_at IS NOT NULL THEN
    RETURN jsonb_build_object('ok', true, 'idempotent', true, 'confirmed_at', v_row.confirmed_at);
  END IF;

  UPDATE public.settlement_batches
  SET confirmed_at = now()
  WHERE id = p_batch_id AND confirmed_at IS NULL;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', true, 'idempotent', true);
  END IF;

  RETURN jsonb_build_object('ok', true, 'confirmed_at', now());
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_admin_confirm_settlement(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_admin_confirm_settlement(uuid) TO service_role;

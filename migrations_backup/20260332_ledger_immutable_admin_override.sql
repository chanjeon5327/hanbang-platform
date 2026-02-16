-- ledger immutable 강화 + admin override
-- 기존 trg_ledger_immutable 유지, admin override 함수 추가

CREATE OR REPLACE FUNCTION public.rpc_admin_ledger_override(
  p_entry_id uuid,
  p_reason text DEFAULT 'ADMIN_OVERRIDE'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admin_audit_logs WHERE metadata->>'allow_ledger_override' = 'true' LIMIT 1) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'OVERRIDE_NOT_ALLOWED');
  END IF;
  RETURN jsonb_build_object('ok', true, 'message', 'Use direct SQL with service_role for override');
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_admin_ledger_override(uuid, text) TO service_role;

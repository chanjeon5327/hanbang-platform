-- PHASE 4: rpc_write_financial_audit, dividend status 전이
CREATE OR REPLACE FUNCTION public.rpc_write_financial_audit(
  p_user_id uuid,
  p_action text,
  p_target_type text,
  p_target_id text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO financial_audit_logs (user_id, action, target_type, target_id, metadata)
  VALUES (p_user_id, p_action, p_target_type, p_target_id, p_metadata);
EXCEPTION WHEN OTHERS THEN
  NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_write_financial_audit(uuid, text, text, text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.rpc_write_financial_audit(uuid, text, text, text, jsonb) TO authenticated;

-- dividend status 전이: DRAFT->CALCULATED->EXECUTED->CONFIRMED->PAID
CREATE OR REPLACE FUNCTION public.fn_dividend_status_transition_valid(old_status text, new_status text)
RETURNS boolean
LANGUAGE plpgsql IMMUTABLE AS $$
BEGIN
  RETURN (old_status, new_status) IN (
    ('DRAFT', 'CALCULATED'), ('DRAFT', 'EXECUTED'),
    ('CALCULATED', 'EXECUTED'), ('CALCULATED', 'CONFIRMED'),
    ('EXECUTED', 'CONFIRMED'), ('EXECUTED', 'PAID'),
    ('CONFIRMED', 'PAID')
  ) OR old_status IS NULL;
END;
$$;

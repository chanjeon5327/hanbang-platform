-- 시뮬레이션 모드 전용: 1,000,000 KRW 가상 충전 (audit 필수)
-- NEXT_PUBLIC_SIMULATION_MODE=true 시에만 사용
CREATE OR REPLACE FUNCTION public.rpc_sim_deposit(p_user_id uuid, p_amount_krw numeric DEFAULT 1000000)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_entry_id uuid;
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'FORBIDDEN: 본인만 충전 가능';
  END IF;

  IF p_amount_krw IS NULL OR p_amount_krw <= 0 THEN
    RAISE EXCEPTION 'INVALID_AMOUNT: 충전 금액은 0보다 커야 합니다.';
  END IF;

  PERFORM set_config('app.audit_written', 'on', true);

  INSERT INTO ledger_entries (user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata)
  VALUES (p_user_id, NULL, 'CASH_CREDIT', 'KRW', p_amount_krw, NULL, 0, 'SIM_DEPOSIT', jsonb_build_object('sim', true))
  RETURNING id INTO v_entry_id;

  PERFORM rpc_write_financial_audit(
    'LEDGER_WRITE',
    'LEDGER_ENTRY',
    v_entry_id::text,
    jsonb_build_object('entry_type', 'CASH_CREDIT', 'amount', p_amount_krw, 'currency', 'KRW', 'memo', 'SIM_DEPOSIT', 'sim', true)
  );

  RETURN jsonb_build_object('ok', true, 'amount_krw', p_amount_krw, 'entry_id', v_entry_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_sim_deposit(uuid, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_sim_deposit(uuid, numeric) TO service_role;

-- rpc_sim_deposit: 시뮬레이션용 CASH_CREDIT 입금 (service_role 전용)
-- run-full-simulation.mjs에서 호출
-- order_id NULL: ledger_entries.order_id가 NOT NULL이면 먼저 ALTER COLUMN order_id DROP NOT NULL 실행

CREATE OR REPLACE FUNCTION public.rpc_sim_deposit(p_user_id uuid, p_amount_krw numeric DEFAULT 100000)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_entry_id uuid;
BEGIN
  -- service_role만 호출 가능 (REVOKE로 anon/authenticated 차단)

  IF p_amount_krw IS NULL OR p_amount_krw <= 0 THEN
    RAISE EXCEPTION 'INVALID_AMOUNT: 충전 금액은 0보다 커야 합니다.';
  END IF;

  INSERT INTO ledger_entries (user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata)
  VALUES (
    p_user_id,
    NULL,
    'CASH_CREDIT',
    'KRW',
    p_amount_krw,
    NULL,
    0,
    'SIM_DEPOSIT',
    jsonb_build_object('sim', true)
  )
  RETURNING id INTO v_entry_id;

  RETURN jsonb_build_object('ok', true, 'amount_krw', p_amount_krw, 'entry_id', v_entry_id);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.rpc_sim_deposit(uuid, numeric) FROM anon;
REVOKE EXECUTE ON FUNCTION public.rpc_sim_deposit(uuid, numeric) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_sim_deposit(uuid, numeric) TO service_role;

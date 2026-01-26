create or replace function reverse_trade(
  p_trade_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_amount numeric;
  v_balance numeric;
begin
  if v_user_id is null then
    raise exception 'unauthorized';
  end if;

  -- 1. 거래 금액 조회
  select amount_krw
  into v_amount
  from trades
  where id = p_trade_id
    and user_id = v_user_id;

  if v_amount is null then
    raise exception 'trade not found';
  end if;

  -- 2. 지갑 잔액 잠금
  select balance_krw
  into v_balance
  from public.wallets
  where user_id = v_user_id
  for update;

  if v_balance is null then
    raise exception 'wallet not found';
  end if;

  -- 3. 지갑 복구
  update public.wallets
  set balance_krw = v_balance + v_amount,
      updated_at = now()
  where user_id = v_user_id;

  -- 4. 원장 기록 (REVERSAL)
  insert into ledger (
    user_id,
    ref_type,
    ref_id,
    delta_krw,
    balance_after
  ) values (
    v_user_id,
    'REVERSAL',
    p_trade_id,
    v_amount,
    v_balance + v_amount
  );

end;
$$;

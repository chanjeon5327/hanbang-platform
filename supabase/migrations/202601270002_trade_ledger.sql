create or replace function invest_trade(
  p_product_id uuid,
  p_amount_krw numeric
) returns uuid
language plpgsql
security definer
set search_path = public
as $$

declare
  v_user_id uuid := auth.uid();
  v_balance numeric;
  v_trade_id uuid;
  v_balance_after numeric;
begin
  -- 인증 체크
  if v_user_id is null then
    raise exception 'unauthorized';
  end if;

  -- 금액 검증
  if p_amount_krw <= 0 then
    raise exception 'invalid amount';
  end if;

  -- wallet 보장 (없으면 생성)
  insert into wallets(user_id, balance_krw)
  values (v_user_id, 0)
  on conflict (user_id) do nothing;

  -- 잔액 잠금 조회
  select balance_krw
    into v_balance
    from wallets
   where user_id = v_user_id
   for update;

  if v_balance < p_amount_krw then
    raise exception 'insufficient balance';
  end if;

  -- 거래 체결
  insert into trades(user_id, product_id, amount_krw)
  values (v_user_id, p_product_id, p_amount_krw)
  returning id into v_trade_id;

  -- 잔액 차감
  v_balance_after := v_balance - p_amount_krw;

  update wallets
     set balance_krw = v_balance_after,
         updated_at = now()
   where user_id = v_user_id;

  -- 불변 원장 기록
  insert into ledger(
    user_id,
    ref_type,
    ref_id,
    delta_krw,
    balance_after
  ) values (
    v_user_id,
    'TRADE',
    v_trade_id,
    -p_amount_krw,
    v_balance_after
  );

  return v_trade_id;
end;
$$;

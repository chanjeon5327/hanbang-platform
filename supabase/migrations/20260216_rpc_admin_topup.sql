create or replace function admin_topup(
  p_user_id uuid,
  p_amount_krw numeric
) returns void
language plpgsql
security definer
set search_path = public
as $$

declare
  v_balance numeric;
  v_balance_after numeric;
begin
  if p_amount_krw <= 0 then
    raise exception 'invalid amount';
  end if;

  insert into wallets(user_id, balance_krw)
  values (p_user_id, 0)
  on conflict (user_id) do nothing;

  select balance_krw
    into v_balance
    from wallets
   where user_id = p_user_id
   for update;

  v_balance_after := v_balance + p_amount_krw;

  update wallets
     set balance_krw = v_balance_after,
         updated_at = now()
   where user_id = p_user_id;

  insert into ledger(
    user_id,
    ref_type,
    ref_id,
    delta_krw,
    balance_after
  ) values (
    p_user_id,
    'TOPUP_MANUAL',
    null,
    p_amount_krw,
    v_balance_after
  );
end;
$$;

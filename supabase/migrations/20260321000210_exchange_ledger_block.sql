-- exchange RPC: ledger 직접 기록 차단 (DB 레벨 방어)
-- requireAdmin으로 API는 막혀 있으나, DB에서도 exchange가 ledger에 쓰지 못하게 방어

-- fn_match_order: ledger INSERT 직전 차단
create or replace function public.fn_match_order(p_taker_order_id uuid)
returns jsonb
language plpgsql security definer as $$
declare
  v_taker record;
begin
  select * into v_taker from public.exchange_orders where id = p_taker_order_id;
  if v_taker is null then return jsonb_build_object('fills', 0); end if;

  raise exception 'EXCHANGE_LEDGER_BLOCKED';
end;
$$;

-- rpc_exchange_place_order: HOLD/ledger INSERT 직전 차단
create or replace function public.rpc_exchange_place_order(
  p_user_id         uuid,
  p_asset_id        uuid,
  p_side            text,
  p_order_type      text,
  p_price           numeric default null,
  p_quantity        numeric default null,
  p_amount_max      numeric default null,
  p_idempotency_key text default null
) returns jsonb
language plpgsql security definer as $$
begin
  raise exception 'EXCHANGE_LEDGER_BLOCKED';
end;
$$;

-- rpc_exchange_cancel_order: ledger INSERT 직전 차단
create or replace function public.rpc_exchange_cancel_order(
  p_user_id  uuid,
  p_order_id uuid
) returns jsonb
language plpgsql security definer as $$
begin
  raise exception 'EXCHANGE_LEDGER_BLOCKED';
end;
$$;

grant execute on function public.fn_match_order(uuid) to authenticated;
grant execute on function public.fn_match_order(uuid) to service_role;
grant execute on function public.rpc_exchange_place_order(uuid, uuid, text, text, numeric, numeric, numeric, text) to authenticated;
grant execute on function public.rpc_exchange_place_order(uuid, uuid, text, text, numeric, numeric, numeric, text) to service_role;
grant execute on function public.rpc_exchange_cancel_order(uuid, uuid) to authenticated;
grant execute on function public.rpc_exchange_cancel_order(uuid, uuid) to service_role;

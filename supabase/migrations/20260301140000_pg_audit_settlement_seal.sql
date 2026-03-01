create extension if not exists pgcrypto;

-- 1) 감사 로그
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  action text not null,
  ref_type text,
  ref_id uuid,
  metadata jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_audit_logs_user on audit_logs(user_id, created_at desc);

-- 2) 정산 배치
create table if not exists settlement_batches (
  id uuid primary key default gen_random_uuid(),
  batch_date date not null,
  status text default 'open', -- open / sealed
  hash text,
  created_at timestamptz default now()
);

-- 3) ledger_entries에 batch_id 연결
alter table if exists ledger_entries
add column if not exists batch_id uuid references settlement_batches(id);

-- 4) ledger 수정 금지 트리거 (batch_id 할당만 허용)
create or replace function prevent_ledger_update()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' and old.batch_id is null and new.batch_id is not null then
    return new;  -- batch_id 할당만 허용
  end if;
  raise exception 'LEDGER_IMMUTABLE';
end;
$$;

drop trigger if exists trg_ledger_no_update on ledger_entries;

create trigger trg_ledger_no_update
before update or delete on ledger_entries
for each row execute function prevent_ledger_update();

-- 5) 정산 봉인 RPC
create or replace function public.rpc_seal_settlement_batch(
  p_batch_id uuid
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_concat text;
  v_hash text;
  v_status text;
begin
  select status into v_status from settlement_batches where id = p_batch_id;
  if v_status is null then raise exception 'BATCH_NOT_FOUND'; end if;
  if v_status = 'sealed' then raise exception 'BATCH_ALREADY_SEALED'; end if;

  select string_agg(id::text || coalesce(amount,0)::text || coalesce(quantity,0)::text, '' order by id)
  into v_concat
  from ledger_entries
  where batch_id = p_batch_id;

  if v_concat is null then
    raise exception 'EMPTY_BATCH';
  end if;

  v_hash := encode(digest(v_concat, 'sha256'), 'hex');

  update settlement_batches
  set status='sealed',
      hash=v_hash
  where id = p_batch_id;

  return json_build_object('ok',true,'hash',v_hash);
end;
$$;

grant execute on function public.rpc_seal_settlement_batch(uuid) to authenticated;
grant execute on function public.rpc_seal_settlement_batch(uuid) to service_role;

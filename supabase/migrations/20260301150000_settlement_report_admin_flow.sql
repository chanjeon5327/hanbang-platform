-- 1) 정산 리포트 테이블
create table if not exists settlement_reports (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references settlement_batches(id),
  report jsonb not null,
  created_at timestamptz default now()
);

-- 2) 정산 배치 생성 RPC
create or replace function public.rpc_create_settlement_batch(
  p_batch_date date
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_batch_id uuid;
begin
  insert into settlement_batches(batch_date,status)
  values(p_batch_date,'open')
  returning id into v_batch_id;

  update ledger_entries
  set batch_id = v_batch_id
  where batch_id is null
    and date(created_at) = p_batch_date;

  insert into audit_logs(user_id,action,ref_type,ref_id,metadata)
  values(null,'SETTLEMENT_BATCH_CREATED','batch',v_batch_id,
         json_build_object('date',p_batch_date));

  return json_build_object('ok',true,'batch_id',v_batch_id);
end;
$$;

grant execute on function public.rpc_create_settlement_batch(date) to authenticated;
grant execute on function public.rpc_create_settlement_batch(date) to service_role;

-- 3) 정산 리포트 생성 RPC (ledger_entries.entry_type 사용)
create or replace function public.rpc_generate_settlement_report(
  p_batch_id uuid
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total_cash numeric;
  v_total_asset numeric;
  v_report jsonb;
begin
  select
    coalesce(sum(case when entry_type='CASH_DEBIT' then abs(amount) else 0 end), 0),
    coalesce(sum(case when entry_type='ASSET_CREDIT' then quantity else 0 end), 0)
  into v_total_cash, v_total_asset
  from ledger_entries
  where batch_id=p_batch_id;

  v_report := jsonb_build_object(
    'total_cash_debit',v_total_cash,
    'total_asset_credit',v_total_asset,
    'generated_at',now()
  );

  insert into settlement_reports(batch_id,report)
  values(p_batch_id,v_report);

  return json_build_object('ok',true,'report',v_report);
end;
$$;

grant execute on function public.rpc_generate_settlement_report(uuid) to authenticated;
grant execute on function public.rpc_generate_settlement_report(uuid) to service_role;

create or replace function public.rpc_create_settlement_batch(
  p_batch_date date
)
returns json
language plpgsql
security definer
as $$
declare
  v_batch_id uuid;
begin
  insert into settlement_batches(batch_date, settlement_date, status)
  values(p_batch_date, p_batch_date, 'open')
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


create or replace function public.rpc_seal_settlement_batch(
  p_batch_id uuid
)
returns json
language plpgsql
security definer
as $$
declare
  v_concat text;
  v_hash text;
  v_has_rows boolean;
begin
  select exists(select 1 from ledger_entries where batch_id=p_batch_id) into v_has_rows;
  if not v_has_rows then
    raise exception 'EMPTY_BATCH';
  end if;

  select string_agg(id::text || amount::text, '' order by created_at asc)
  into v_concat
  from ledger_entries
  where batch_id = p_batch_id;

  v_hash := encode(digest(v_concat, 'sha256'), 'hex');

  update settlement_batches
  set status='sealed',
      hash=v_hash,
      finalized_at=now()
  where id=p_batch_id;

  insert into audit_logs(user_id,action,ref_type,ref_id,metadata)
  values(null,'SETTLEMENT_BATCH_SEALED','batch',p_batch_id,
         json_build_object('hash',v_hash));

  return json_build_object('ok',true,'hash',v_hash);
end;
$$;

grant execute on function public.rpc_seal_settlement_batch(uuid) to authenticated;

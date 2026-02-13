-- 정산 확정 이후 ledger_entries 수정/삭제 차단

create or replace function prevent_ledger_mutation_after_settlement()
returns trigger
language plpgsql
as $$
declare
  v_confirmed_at timestamptz;
begin

  select sb.confirmed_at
  into v_confirmed_at
  from orders o
  join settlement_batches sb
    on sb.id = o.settlement_batch_id
  where o.id = old.order_id;

  if v_confirmed_at is not null then
    raise exception 'LEDGER_LOCKED_AFTER_SETTLEMENT';
  end if;

  return old;

end;
$$;

drop trigger if exists trg_prevent_ledger_update on ledger_entries;

create trigger trg_prevent_ledger_update
before update on ledger_entries
for each row
execute function prevent_ledger_mutation_after_settlement();

drop trigger if exists trg_prevent_ledger_delete on ledger_entries;

create trigger trg_prevent_ledger_delete
before delete on ledger_entries
for each row
execute function prevent_ledger_mutation_after_settlement();

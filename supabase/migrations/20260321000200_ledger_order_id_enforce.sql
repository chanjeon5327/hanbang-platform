-- 1) 기존 NULL 존재 여부 검사
do $$
begin
  if exists (select 1 from ledger_entries where order_id is null) then
    raise exception 'ledger_entries contains NULL order_id rows. Cleanup required before enforcing NOT NULL.';
  end if;
end$$;

-- 2) FK 강제 (없으면 추가)
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'ledger_entries_order_id_fkey'
  ) then
    alter table ledger_entries
      add constraint ledger_entries_order_id_fkey
      foreign key (order_id)
      references orders(id)
      on delete restrict;
  end if;
end$$;

-- 3) NOT NULL 강제
alter table ledger_entries
  alter column order_id set not null;

-- 4) 인덱스 보강
create index if not exists idx_ledger_entries_order_id
  on ledger_entries(order_id);

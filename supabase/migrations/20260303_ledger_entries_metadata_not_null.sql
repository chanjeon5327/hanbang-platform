-- ledger_entries.metadata NOT NULL 강제
update public.ledger_entries
set metadata = '{}'
where metadata is null;

alter table public.ledger_entries
alter column metadata set default '{}'::jsonb;

alter table public.ledger_entries
alter column metadata set not null;

-- settlement_batches 스키마 충돌 호환/통일 패치
-- 어떤 마이그레이션이 먼저 실행됐든, 이 패치 이후에는 아래 컬럼이 항상 존재해야 한다.

alter table if exists settlement_batches
  add column if not exists batch_date date,
  add column if not exists settlement_date date,
  add column if not exists status text,
  add column if not exists hash text,
  add column if not exists finalized_at timestamptz,
  add column if not exists created_at timestamptz default now();

-- 기존 데이터 이관 규칙:
-- 1) batch_date가 없고 settlement_date만 있으면 batch_date=settlement_date
update settlement_batches
set batch_date = settlement_date
where batch_date is null and settlement_date is not null;

-- 2) settlement_date가 없고 batch_date만 있으면 settlement_date=batch_date
update settlement_batches
set settlement_date = batch_date
where settlement_date is null and batch_date is not null;

-- 3) status 기본값 보정 (sealed/open)
update settlement_batches
set status = case
  when finalized_at is not null then 'sealed'
  when status is null then 'open'
  else status
end;

-- status 값 범위 고정 (있으면 스킵)
do $$
begin
  if not exists (select 1 from pg_constraint where conname='chk_settlement_batches_status') then
    alter table settlement_batches
      add constraint chk_settlement_batches_status
      check (status in ('open','sealed'));
  end if;
end$$;

-- 인덱스 보강
create index if not exists idx_settlement_batches_batch_date on settlement_batches(batch_date desc);
create index if not exists idx_settlement_batches_status on settlement_batches(status);

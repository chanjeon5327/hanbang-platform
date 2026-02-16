-- PHASE 1-1: CONTENT STATUS STRUCTURE FIX
-- content_items 상태 구조 보강

-- 1) status enum 생성
do $$
begin
  if not exists (select 1 from pg_type where typname = 'content_status_enum') then
    create type content_status_enum as enum (
      'DRAFT',
      'PENDING',
      'ACTIVE',
      'REJECTED'
    );
  end if;
end$$;

-- 2) content_items 컬럼 보강
alter table content_items
  add column if not exists status content_status_enum default 'DRAFT',
  add column if not exists is_tradeable boolean default false,
  add column if not exists rejection_reason text,
  add column if not exists short_description text,
  add column if not exists dividend_policy text;

-- 3) 인덱스
create index if not exists idx_content_status
  on content_items(status);

-- 4) 승인된 콘텐츠만 메인에 노출하도록 기본 조건 명확화
comment on column content_items.status is
'콘텐츠 상태: DRAFT(작성중) / PENDING(승인대기) / ACTIVE(승인완료) / REJECTED(반려)';

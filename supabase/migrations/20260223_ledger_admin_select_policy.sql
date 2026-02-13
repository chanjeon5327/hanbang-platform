-- ============================================================
-- ledger_entries 관리자 전용 SELECT 정책 분리
-- - 일반 authenticated: 자기 user_id row만 (기존 "ledger select own" 유지)
-- - 관리자: 전체 ledger_entries 조회 가능 (profiles.role = 'ADMIN')
-- ============================================================
-- 관리자 판별 근거:
--   lib/admin/requireAdmin.ts, context/AuthContext.tsx
--   profiles.role = 'ADMIN' (supabase/migrations/20260218_profiles_role_status.sql)
--   isAdminEmail()는 환경변수 기반이라 DB RLS에서 사용 불가 → profiles.role만 사용
-- ============================================================

begin;

-- 0) RLS 유지
alter table public.ledger_entries enable row level security;

-- 1) 기존 "ledger select own" 유지 (일반 유저: 본인 row만)
--    이미 존재하면 skip. 없으면 생성.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'ledger_entries'
      and policyname = 'ledger select own'
  ) then
    create policy "ledger select own"
      on public.ledger_entries
      for select
      using (auth.uid() = user_id);
  end if;
end $$;

-- 2) 관리자 전용 전체 조회 정책 추가
drop policy if exists "ledger select admin" on public.ledger_entries;
create policy "ledger select admin"
  on public.ledger_entries
  for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'ADMIN'
    )
  );

commit;

-- ============================================================
-- 테스트 쿼리 3종
-- ============================================================
-- (Supabase Dashboard > Table Editor > ledger_entries > "Run as user" 또는 REST API로 검증)

-- [테스트 1] 일반 유저: 본인 row만
-- REST: GET /rest/v1/ledger_entries (Authorization: Bearer <일반유저_JWT>)
-- 예상: user_id = JWT.sub 인 row만 반환

-- [테스트 2] 관리자: 전체 조회
-- REST: GET /rest/v1/ledger_entries (Authorization: Bearer <관리자_JWT>, profiles.role='ADMIN')
-- 예상: 전체 row 반환

-- [테스트 3] 익명: 조회 불가
-- REST: GET /rest/v1/ledger_entries (anon key, Authorization 없음)
-- 예상: 403 permission denied for table ledger_entries

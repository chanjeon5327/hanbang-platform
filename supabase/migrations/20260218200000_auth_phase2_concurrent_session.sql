-- ============================================================
-- AUTH Phase-2: 동시 로그인 제한 (Concurrent Session Control)
-- ============================================================

-- 1) profiles에 session_version 컬럼 추가
-- 로그인마다 새 UUID가 발급되어 중복 세션 무효화에 사용
alter table profiles
  add column if not exists session_version uuid;

comment on column profiles.session_version is
  'AUTH Phase-2: 로그인 시 갱신되는 세션 버전 토큰. 미들웨어에서 불일치 시 강제 로그아웃.';

-- 인덱스
create index if not exists idx_profiles_session_version
  on profiles(session_version);

-- 2) auth_login_audit에 실패 사유/이벤트 유형 컬럼 추가
alter table auth_login_audit
  add column if not exists event_type text default 'login'
    check (event_type in ('login', 'concurrent_evict', 'force_logout', 'session_refresh'));

alter table auth_login_audit
  add column if not exists failure_reason text;

comment on column auth_login_audit.event_type     is 'login|concurrent_evict|force_logout|session_refresh';
comment on column auth_login_audit.failure_reason is '실패 시 사유 요약';

-- 3) 감사로그 조회용 Admin RPC
--    인자: p_limit, p_offset, p_period_days, p_success, p_email
create or replace function rpc_admin_audit_logins(
  p_limit      int     default 200,
  p_offset     int     default 0,
  p_period_days int    default 7,
  p_success    boolean default null,
  p_email      text    default null
)
returns table (
  id              uuid,
  user_id         uuid,
  email           text,
  ip_address      text,
  user_agent      text,
  success         boolean,
  event_type      text,
  failure_reason  text,
  created_at      timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    a.id, a.user_id, a.email, a.ip_address, a.user_agent,
    a.success, a.event_type, a.failure_reason, a.created_at
  from auth_login_audit a
  where
    a.created_at >= now() - make_interval(days => p_period_days)
    and (p_success is null or a.success = p_success)
    and (p_email is null or a.email ilike '%' || p_email || '%')
  order by a.created_at desc
  limit  p_limit
  offset p_offset;
end;
$$;

-- 4) 감사로그 총 건수 RPC (페이지네이션용)
create or replace function rpc_admin_audit_logins_count(
  p_period_days int     default 7,
  p_success     boolean default null,
  p_email       text    default null
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count bigint;
begin
  select count(*) into v_count
  from auth_login_audit a
  where
    a.created_at >= now() - make_interval(days => p_period_days)
    and (p_success is null or a.success = p_success)
    and (p_email is null or a.email ilike '%' || p_email || '%');
  return v_count;
end;
$$;

-- RPC 권한: service_role 전용 (보안)
revoke all on function rpc_admin_audit_logins from public, anon, authenticated;
revoke all on function rpc_admin_audit_logins_count from public, anon, authenticated;
grant execute on function rpc_admin_audit_logins        to service_role;
grant execute on function rpc_admin_audit_logins_count  to service_role;

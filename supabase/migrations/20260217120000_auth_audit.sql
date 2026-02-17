-- 로그인 감사 로그 테이블
-- 금융 플랫폼 수준의 인증 보안을 위한 모든 로그인 시도 기록

create table if not exists auth_login_audit (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  email text,
  ip_address text,
  user_agent text,
  success boolean not null,
  created_at timestamptz default now()
);

-- 이메일 기반 조회 (계정 잠금 확인 시 사용)
create index if not exists idx_auth_login_email on auth_login_audit(email);

-- 시간 기반 조회 (최근 로그인 실패 카운트)
create index if not exists idx_auth_login_created_at on auth_login_audit(created_at);

-- 성공/실패 필터링
create index if not exists idx_auth_login_success on auth_login_audit(success);

-- 복합 인덱스: 이메일 + 시간 (계정 잠금 쿼리 최적화)
create index if not exists idx_auth_login_email_created on auth_login_audit(email, created_at desc);

comment on table auth_login_audit is '로그인 시도 감사 로그 - 성공/실패 모두 기록';
comment on column auth_login_audit.user_id is '로그인 성공 시 사용자 ID';
comment on column auth_login_audit.email is '시도한 이메일 주소';
comment on column auth_login_audit.success is 'true: 성공, false: 실패';

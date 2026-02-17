-- profiles 테이블에 로그인 보안 관련 컬럼 추가

-- 마지막 로그인 시간 (로그인 성공 시 업데이트)
alter table profiles 
add column if not exists last_login_at timestamptz;

-- 관리자 강제 로그아웃 시간 (이 시간 이후 로그인은 무효화)
alter table profiles 
add column if not exists force_logout_at timestamptz;

-- 인덱스 추가
create index if not exists idx_profiles_last_login on profiles(last_login_at);
create index if not exists idx_profiles_force_logout on profiles(force_logout_at);

comment on column profiles.last_login_at is '마지막 로그인 성공 시간';
comment on column profiles.force_logout_at is '관리자 강제 로그아웃 기준 시간 - last_login_at보다 크면 세션 무효화';

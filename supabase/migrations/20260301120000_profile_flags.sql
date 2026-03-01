-- profiles에 KYC/온보딩 상태 컬럼 추가
alter table if exists profiles
  add column if not exists kyc_status text default 'pending',
  add column if not exists onboarding_completed boolean default false;

update profiles set kyc_status = 'pending' where kyc_status is null;

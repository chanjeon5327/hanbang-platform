-- profiles에 투자 한도 컬럼 추가 (auth.users 대신 profiles 사용)

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS daily_invest_limit bigint DEFAULT 1000000;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS monthly_invest_limit bigint DEFAULT 10000000;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kyc_level int DEFAULT 1;

COMMENT ON COLUMN public.profiles.daily_invest_limit IS '일일 투자 한도 (원)';
COMMENT ON COLUMN public.profiles.monthly_invest_limit IS '월간 투자 한도 (원)';
COMMENT ON COLUMN public.profiles.kyc_level IS 'KYC 레벨 (1=기본, 2=본인인증, 3=고급)';

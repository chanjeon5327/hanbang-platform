-- profiles에 가입 방식(signup_method) 컬럼 추가
-- email | google | kakao | metamask
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS signup_method text DEFAULT 'email';
COMMENT ON COLUMN public.profiles.signup_method IS '가입 방식: email, google, kakao, metamask';

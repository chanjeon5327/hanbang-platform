-- user_onboarding_status에 선호 카테고리/선택 결과 저장용 컬럼 추가
ALTER TABLE public.user_onboarding_status ADD COLUMN IF NOT EXISTS preference_summary jsonb DEFAULT '{}';
COMMENT ON COLUMN public.user_onboarding_status.preference_summary IS '온보딩 선택 결과: preferred_categories, rated_count, round_completed 등';

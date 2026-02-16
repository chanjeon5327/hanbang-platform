-- ============================================
-- 런칭 완성형: 상태머신 + KYC + 온보딩
-- profiles.status, kyc_verifications, channels, user_channel_ratings, user_taste_profile
-- ============================================

-- 1) profiles.status: NEW → KYC_REQUIRED → KYC_SUBMITTED → KYC_APPROVED → ONBOARDING_REQUIRED → ACTIVE
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'status'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN status text NOT NULL DEFAULT 'NEW'
      CHECK (status IN ('NEW', 'KYC_REQUIRED', 'KYC_SUBMITTED', 'KYC_APPROVED', 'ONBOARDING_REQUIRED', 'ACTIVE', 'SUSPENDED'));
    COMMENT ON COLUMN public.profiles.status IS '유저 상태머신: NEW→KYC_REQUIRED→KYC_SUBMITTED→KYC_APPROVED→ONBOARDING_REQUIRED→ACTIVE';
  ELSE
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_status_check;
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_status_check
      CHECK (status IN ('NEW', 'KYC_REQUIRED', 'KYC_SUBMITTED', 'KYC_APPROVED', 'ONBOARDING_REQUIRED', 'ACTIVE', 'SUSPENDED'));
  END IF;
END $$;

-- 기존 profiles에 status 없으면 ACTIVE로 (기존 유저)
UPDATE public.profiles SET status = 'ACTIVE' WHERE status IS NULL OR status = '';

-- 2) kyc_verifications (URL/메타데이터 방식, 나중에 스토리지로 교체 가능)
CREATE TABLE IF NOT EXISTS public.kyc_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  real_name text,
  birth_date date,
  phone text,
  address text,
  id_card_front_url text,
  id_card_back_url text,
  selfie_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'approved', 'rejected')),
  rejection_reason text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_kyc_verifications_user ON public.kyc_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_verifications_status ON public.kyc_verifications(status);

ALTER TABLE public.kyc_verifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS kyc_verifications_select_own ON public.kyc_verifications;
CREATE POLICY kyc_verifications_select_own ON public.kyc_verifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS kyc_verifications_insert_own ON public.kyc_verifications;
CREATE POLICY kyc_verifications_insert_own ON public.kyc_verifications FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS kyc_verifications_update_own ON public.kyc_verifications;
CREATE POLICY kyc_verifications_update_own ON public.kyc_verifications FOR UPDATE USING (auth.uid() = user_id);

-- 3) kyc_submissions (제출 이력, 관리자용)
CREATE TABLE IF NOT EXISTS public.kyc_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  step text,
  status text DEFAULT 'submitted',
  payload_json jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_kyc_submissions_user ON public.kyc_submissions(user_id);

ALTER TABLE public.kyc_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS kyc_submissions_select_own ON public.kyc_submissions;
CREATE POLICY kyc_submissions_select_own ON public.kyc_submissions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS kyc_submissions_insert_own ON public.kyc_submissions;
CREATE POLICY kyc_submissions_insert_own ON public.kyc_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 관리자: kyc_submissions 전체 조회 (service_role로)
-- RLS에서 admin은 profiles.role='ADMIN'으로 판단 불가(anon키) → admin API는 createAdminClient 사용

-- 4) investor_profiles (없으면 생성)
CREATE TABLE IF NOT EXISTS public.investor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  grade text NOT NULL DEFAULT 'GENERAL' CHECK (grade IN ('GENERAL', 'QUALIFIED', 'PRO')),
  investment_limit numeric(20,0) NOT NULL DEFAULT 50000000,
  kyc_status text NOT NULL DEFAULT 'PENDING' CHECK (kyc_status IN ('PENDING', 'APPROVED', 'REJECTED')),
  risk_acknowledged_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_investor_profiles_user ON public.investor_profiles(user_id);
ALTER TABLE public.investor_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS investor_profiles_select_own ON public.investor_profiles;
CREATE POLICY investor_profiles_select_own ON public.investor_profiles FOR SELECT USING (auth.uid() = user_id);

-- 5) 온보딩: channels (시드), channel_tags, user_channel_ratings, user_taste_profile
CREATE TABLE IF NOT EXISTS public.channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE,
  category text,
  thumbnail_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.channel_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  tag text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_channel_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id uuid NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  score int NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 5),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, channel_id)
);

CREATE INDEX IF NOT EXISTS idx_user_channel_ratings_user ON public.user_channel_ratings(user_id);

CREATE TABLE IF NOT EXISTS public.user_taste_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  summary jsonb DEFAULT '{}',
  onboarding_completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_taste_profile_user ON public.user_taste_profile(user_id);

ALTER TABLE public.user_channel_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_taste_profile ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_channel_ratings_own ON public.user_channel_ratings;
CREATE POLICY user_channel_ratings_own ON public.user_channel_ratings
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS user_taste_profile_own ON public.user_taste_profile;
CREATE POLICY user_taste_profile_own ON public.user_taste_profile
  FOR ALL USING (auth.uid() = user_id);

-- channels, channel_tags: 공개 읽기
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS channels_select_all ON public.channels;
CREATE POLICY channels_select_all ON public.channels FOR SELECT USING (true);

ALTER TABLE public.channel_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS channel_tags_select_all ON public.channel_tags;
CREATE POLICY channel_tags_select_all ON public.channel_tags FOR SELECT USING (true);

-- 6) 시드 채널 (최소 데이터, 비어있을 때만)
INSERT INTO public.channels (name, slug, category)
SELECT '유튜브 여행가 제이', 'youtube-travel-j', 'youtube' WHERE NOT EXISTS (SELECT 1 FROM public.channels)
UNION ALL SELECT '전지적 독자 시점', 'omniscient-reader', 'webtoon' WHERE NOT EXISTS (SELECT 1 FROM public.channels)
UNION ALL SELECT 'BTS', 'bts', 'kpop' WHERE NOT EXISTS (SELECT 1 FROM public.channels)
UNION ALL SELECT '오징어 게임', 'squid-game', 'drama' WHERE NOT EXISTS (SELECT 1 FROM public.channels)
UNION ALL SELECT 'Dune', 'dune', 'movie' WHERE NOT EXISTS (SELECT 1 FROM public.channels);

-- 7) user_status_log (관리자용 유저 상태/로그)
CREATE TABLE IF NOT EXISTS public.user_status_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_status text,
  to_status text NOT NULL,
  reason text,
  actor_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_status_log_user ON public.user_status_log(user_id);

ALTER TABLE public.user_status_log ENABLE ROW LEVEL SECURITY;
-- 관리자만 조회 (service_role 사용 시 RLS 우회)

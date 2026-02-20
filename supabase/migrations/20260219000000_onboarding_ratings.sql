-- ============================================
-- 채널평가 온보딩(취향등록) DB 실체화 v1
-- onboarding_channels, user_interest_ratings, user_onboarding_status, user_taste_score
-- ============================================

-- 1) onboarding_channels (공개 채널 풀)
CREATE TABLE IF NOT EXISTS public.onboarding_channels (
  id text PRIMARY KEY,
  name text NOT NULL,
  category text,
  keywords jsonb,
  thumbnail_url text,
  rank int,
  created_at timestamptz DEFAULT now()
);

-- anon/auth 둘 다 select 가능
ALTER TABLE public.onboarding_channels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS onboarding_channels_select_all ON public.onboarding_channels;
CREATE POLICY onboarding_channels_select_all ON public.onboarding_channels
  FOR SELECT USING (true);

-- RPC: 랜덤 50개 채널 (API용)
CREATE OR REPLACE FUNCTION public.get_random_onboarding_channels(lim int DEFAULT 50)
RETURNS SETOF public.onboarding_channels AS $$
  SELECT * FROM public.onboarding_channels ORDER BY random() LIMIT lim;
$$ LANGUAGE sql SECURITY DEFINER;

-- 2) user_interest_ratings (유저 평가 로그) - user_taste_score 뷰와 호환
CREATE TABLE IF NOT EXISTS public.user_interest_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id text NOT NULL,
  score int NOT NULL CHECK (score BETWEEN 1 AND 5),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, item_id)
);

-- item_id: onboarding 채널 id 또는 content id (interest/rate API 호환, FK 없음)

CREATE INDEX IF NOT EXISTS idx_user_interest_ratings_user_created
  ON public.user_interest_ratings(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_interest_ratings_item
  ON public.user_interest_ratings(item_id);

ALTER TABLE public.user_interest_ratings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS user_interest_ratings_select_own ON public.user_interest_ratings;
DROP POLICY IF EXISTS user_interest_ratings_insert_own ON public.user_interest_ratings;
DROP POLICY IF EXISTS user_interest_ratings_update_own ON public.user_interest_ratings;
DROP POLICY IF EXISTS user_interest_ratings_delete_own ON public.user_interest_ratings;

CREATE POLICY user_interest_ratings_select_own ON public.user_interest_ratings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY user_interest_ratings_insert_own ON public.user_interest_ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY user_interest_ratings_update_own ON public.user_interest_ratings
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY user_interest_ratings_delete_own ON public.user_interest_ratings
  FOR DELETE USING (auth.uid() = user_id);

-- 3) user_onboarding_status (온보딩 완료/스킵)
CREATE TABLE IF NOT EXISTS public.user_onboarding_status (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_at timestamptz,
  skipped boolean DEFAULT false,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.user_onboarding_status ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS user_onboarding_status_select_own ON public.user_onboarding_status;
DROP POLICY IF EXISTS user_onboarding_status_insert_own ON public.user_onboarding_status;
DROP POLICY IF EXISTS user_onboarding_status_update_own ON public.user_onboarding_status;

CREATE POLICY user_onboarding_status_select_own ON public.user_onboarding_status
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY user_onboarding_status_insert_own ON public.user_onboarding_status
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY user_onboarding_status_update_own ON public.user_onboarding_status
  FOR UPDATE USING (auth.uid() = user_id);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_onboarding_status_updated_at ON public.user_onboarding_status;
CREATE TRIGGER user_onboarding_status_updated_at
  BEFORE UPDATE ON public.user_onboarding_status
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4) user_taste_score 뷰
CREATE OR REPLACE VIEW public.user_taste_score AS
SELECT user_id, item_id, avg(score)::float AS taste_score
FROM public.user_interest_ratings
GROUP BY user_id, item_id;

-- 5) ui_funnel_score_v3 존재 시 ui_funnel_personalized_score 조건부 생성
DO $$
BEGIN
  IF to_regclass('public.ui_funnel_score_v3') IS NOT NULL THEN
    EXECUTE '
      CREATE OR REPLACE VIEW public.ui_funnel_personalized_score AS
      SELECT u.user_id, u.item_id, u.taste_score AS personalized_score
      FROM public.user_taste_score u
    ';
  END IF;
END $$;

-- profanityFilter → 관리자 설정 기반 테이블화 준비
-- 향후 admin이 금지어를 DB에서 관리할 수 있도록 테이블 생성

CREATE TABLE IF NOT EXISTS public.profanity_words (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profanity_words_active ON public.profanity_words (is_active) WHERE is_active = true;

-- RLS: 읽기는 모두 (활성 금지어만), 쓰기는 service_role 또는 추후 ADMIN RPC
ALTER TABLE public.profanity_words ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profanity_words_select_active"
  ON public.profanity_words FOR SELECT
  USING (is_active = true);

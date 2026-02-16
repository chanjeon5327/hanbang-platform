-- 20260227_chat_profiles.sql
-- 1) profiles에 nickname, avatar_url 추가 (없으면)
-- 2) product_chat_messages 테이블 생성
-- 3) RLS + 정책
-- 4) 인덱스

-- 1) profiles 확장
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nickname text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;
-- avatar_url은 20241220000000_create_profiles.sql에 이미 있을 수 있음

-- 2) product_chat_messages
CREATE TABLE IF NOT EXISTS public.product_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  is_pinned boolean NOT NULL DEFAULT false,
  is_deleted boolean NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_product_chat_messages_product_created
  ON public.product_chat_messages (product_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_product_chat_messages_product_pinned_created
  ON public.product_chat_messages (product_id, is_pinned DESC, created_at DESC);

-- 3) RLS
ALTER TABLE public.product_chat_messages ENABLE ROW LEVEL SECURITY;

-- SELECT: 누구나 (비로그인 읽기)
CREATE POLICY "product_chat_messages_select_all"
  ON public.product_chat_messages FOR SELECT
  USING (is_deleted = false);

-- INSERT: auth.uid() = user_id (로그인 유저만)
CREATE POLICY "product_chat_messages_insert_own"
  ON public.product_chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: 본인만 또는 ADMIN (is_deleted/is_pinned 조작)
CREATE POLICY "product_chat_messages_update_own"
  ON public.product_chat_messages FOR UPDATE
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN'))
  WITH CHECK (true);

-- 4) content_items에 deadline 추가 (마감임박 API용)
ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS deadline timestamptz;

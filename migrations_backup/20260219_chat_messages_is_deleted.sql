-- chat_messages_v2 소프트 삭제 지원
-- 정책: 삭제는 is_deleted = true 로만 (물리 삭제 금지)

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'chat_messages_v2') THEN
    ALTER TABLE public.chat_messages_v2 ADD COLUMN IF NOT EXISTS is_deleted boolean NOT NULL DEFAULT false;
  END IF;
END $$;

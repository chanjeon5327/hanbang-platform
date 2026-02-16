-- profiles에 creator_status 추가 (CREATOR role용)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS creator_status text DEFAULT 'PENDING' CHECK (creator_status IN ('PENDING', 'APPROVED', 'REJECTED'));
COMMENT ON COLUMN public.profiles.creator_status IS '출품자 승인 상태 (PENDING=대기, APPROVED=승인, REJECTED=거절)';

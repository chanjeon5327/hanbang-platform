-- content_items에 모집 금액 컬럼 추가
ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS total_raise bigint;
ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS current_raise bigint;

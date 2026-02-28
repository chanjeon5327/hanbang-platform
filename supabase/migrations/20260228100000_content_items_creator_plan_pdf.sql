-- content_items에 작가의 기획 PDF URL 컬럼 추가
ALTER TABLE public.content_items
ADD COLUMN IF NOT EXISTS creator_plan_pdf text;

COMMENT ON COLUMN public.content_items.creator_plan_pdf IS '작가의 기획 PDF 파일 URL (Supabase Storage)';

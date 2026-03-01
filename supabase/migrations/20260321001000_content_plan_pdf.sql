-- content_items에 작가의 기획 PDF URL 컬럼 추가 (plan_pdf_url)
-- creator_plan_pdf와 병행 사용 가능, plan_pdf_url 우선
ALTER TABLE IF EXISTS public.content_items
  ADD COLUMN IF NOT EXISTS plan_pdf_url text;

COMMENT ON COLUMN public.content_items.plan_pdf_url IS '작가의 기획 PDF 파일 URL (Supabase Storage creator-plans 버킷)';

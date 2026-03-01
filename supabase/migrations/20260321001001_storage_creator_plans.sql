-- creator-plans 버킷: 작가의 기획 PDF 저장
-- 경로: creator-plans/{content_id}/plan.pdf
-- public=true: 다운로드용 공개 URL
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'creator-plans',
  'creator-plans',
  true,
  10485760,  -- 10MB
  ARRAY['application/pdf']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 업로드 정책: authenticated 사용자만 creator-plans 버킷에 업로드 가능
DROP POLICY IF EXISTS "creator_plans_authenticated_upload" ON storage.objects;
CREATE POLICY "creator_plans_authenticated_upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'creator-plans');

-- 읽기 정책: public 버킷이므로 모든 사용자 읽기 가능
DROP POLICY IF EXISTS "creator_plans_public_read" ON storage.objects;
CREATE POLICY "creator_plans_public_read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'creator-plans');

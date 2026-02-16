-- content_items에 youtube_video_id, media_url 추가 (상세 페이지 영상용)
ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS youtube_video_id text;
ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS media_url text;

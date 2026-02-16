-- content_items에 artist_keyword 추가 (아티스트 파트너십 배지용)

ALTER TABLE public.content_items
ADD COLUMN IF NOT EXISTS artist_keyword text;

CREATE INDEX IF NOT EXISTS idx_content_items_artist_keyword
ON public.content_items (artist_keyword);

-- 아티스트 목표 금액 설정

ALTER TABLE public.content_items
ADD COLUMN IF NOT EXISTS artist_target_amount bigint DEFAULT 100000000;

-- 아티스트별 기준 테이블 (선택적 확장)
CREATE TABLE IF NOT EXISTS public.artist_targets (
  artist_keyword text PRIMARY KEY,
  target_amount bigint NOT NULL DEFAULT 100000000
);

-- content_items 이벤트 날짜 (D-Day 모멘텀용)

ALTER TABLE public.content_items
ADD COLUMN IF NOT EXISTS event_date timestamptz;

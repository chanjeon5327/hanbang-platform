-- products.content_id 추가: content_items(id) 기준 판매/정산 설정 전용
-- A안: products.content_id → content_items(id) FK

BEGIN;

-- 1) content_id 컬럼 추가 (nullable, backfill 후 NOT NULL)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS content_id uuid;

-- 2) backfill: products.id가 content_items.id와 동일한 경우
UPDATE public.products p
SET content_id = p.id
WHERE p.content_id IS NULL
  AND EXISTS (SELECT 1 FROM public.content_items ci WHERE ci.id = p.id);

-- 3) backfill: products.id가 content_items에 없으면, content_items에 동일 id로 1건 생성
--    (e2e/시드용 products가 content_items 없이 존재할 수 있음)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT p.id, p.title, p.created_at
    FROM public.products p
    WHERE p.content_id IS NULL
      AND NOT EXISTS (SELECT 1 FROM public.content_items ci WHERE ci.id = p.id)
  LOOP
    INSERT INTO public.content_items (id, title, status, created_at)
    VALUES (r.id, COALESCE(r.title, '시드 콘텐츠'), 'TRADABLE'::content_status, COALESCE(r.created_at, now()))
    ON CONFLICT (id) DO NOTHING;
  END LOOP;
END $$;

UPDATE public.products p
SET content_id = p.id
WHERE p.content_id IS NULL
  AND EXISTS (SELECT 1 FROM public.content_items ci WHERE ci.id = p.id);

-- 4) FK 추가
ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS fk_products_content_id;
ALTER TABLE public.products
  ADD CONSTRAINT fk_products_content_id
  FOREIGN KEY (content_id) REFERENCES public.content_items(id) ON DELETE RESTRICT;

-- 5) NOT NULL (backfill 완료 후, 남은 row는 content_id=id로 설정)
UPDATE public.products SET content_id = id WHERE content_id IS NULL;
ALTER TABLE public.products ALTER COLUMN content_id SET NOT NULL;

-- 6) 인덱스
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_content_id ON public.products (content_id);

COMMIT;

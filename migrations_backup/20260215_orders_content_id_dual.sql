-- orders.content_id 추가: content_items(id) 기준 듀얼 운영
-- product_id는 유지, content_id 병행 저장

BEGIN;

-- 0) product_id nullable 전환 (content_id만 있는 주문 허용)
ALTER TABLE public.orders ALTER COLUMN product_id DROP NOT NULL;

-- 1) content_id 컬럼 추가 (nullable)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS content_id uuid;

-- 2) backfill: products.content_id 사용
UPDATE public.orders o
SET content_id = p.content_id
FROM public.products p
WHERE o.product_id = p.id
  AND o.content_id IS NULL
  AND p.content_id IS NOT NULL;

-- 3) backfill: products에 없으면 product_id가 content_items.id인 경우 그대로 사용
UPDATE public.orders o
SET content_id = o.product_id
WHERE o.content_id IS NULL
  AND EXISTS (SELECT 1 FROM public.content_items ci WHERE ci.id = o.product_id);

-- 4) FK 추가 (nullable이므로 제약 없음)
ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS fk_orders_content_id;
ALTER TABLE public.orders
  ADD CONSTRAINT fk_orders_content_id
  FOREIGN KEY (content_id) REFERENCES public.content_items(id) ON DELETE RESTRICT;

-- 5) 인덱스
CREATE INDEX IF NOT EXISTS idx_orders_content_id ON public.orders (content_id);

-- 6) v_join_to_buy_7d 뷰 수정 (o.content_id 사용 가능)
DROP VIEW IF EXISTS public.v_join_to_buy_7d;
CREATE OR REPLACE VIEW public.v_join_to_buy_7d AS
SELECT
  ci.id AS content_id,
  count(DISTINCT jf.user_id) AS joins_7d,
  count(DISTINCT o.user_id) AS buyers_7d,
  CASE
    WHEN count(DISTINCT jf.user_id) = 0 THEN 0
    ELSE round(count(DISTINCT o.user_id)::numeric / count(DISTINCT jf.user_id), 4)
  END AS conversion_rate_7d
FROM public.content_items ci
LEFT JOIN public.join_funnel jf
  ON jf.content_id = ci.id AND jf.created_at >= now() - interval '7 day'
LEFT JOIN public.orders o
  ON (o.content_id = ci.id OR (o.content_id IS NULL AND o.product_id = ci.id))
  AND o.created_at >= now() - interval '7 day'
GROUP BY ci.id;

COMMIT;

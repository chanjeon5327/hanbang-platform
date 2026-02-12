-- E2E 테스트용 시드 상품 (기존 products 없을 때만)
-- 주문 생성 시 product_id로 사용 가능하도록 1건 삽입
INSERT INTO public.products (id, seller_id, title, price, status)
SELECT
  'a1b2c3d4-e5f6-4789-a012-345678901234'::uuid,
  (SELECT id FROM auth.users LIMIT 1),
  'E2E 테스트 수익권',
  10000,
  'open'
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE id = 'a1b2c3d4-e5f6-4789-a012-345678901234'::uuid)
AND EXISTS (SELECT 1 FROM auth.users LIMIT 1);

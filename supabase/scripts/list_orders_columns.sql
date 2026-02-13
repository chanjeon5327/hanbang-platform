-- orders 테이블 실제 컬럼 조회 (Supabase SQL Editor에서 실행)
-- app/api/orders/place 에서 insert 시 이 컬럼명과 맞춰야 함.
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'orders'
ORDER BY ordinal_position;

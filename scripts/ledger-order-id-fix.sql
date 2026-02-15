-- PHASE 2: order_id NOT NULL 해제 (Supabase SQL Editor)
-- 대상: public.ledger_entries (PHASE1-1에서 kind='TABLE' 확인 후 실행)

ALTER TABLE public.ledger_entries ALTER COLUMN order_id DROP NOT NULL;

-- 반복 검증
SELECT table_schema, table_name, is_nullable
FROM information_schema.columns
WHERE column_name='order_id'
AND table_schema='public'
AND table_name IN ('ledger_entries')
ORDER BY table_name;

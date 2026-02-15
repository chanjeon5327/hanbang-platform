-- PHASE 4 재검증 (Supabase SQL Editor)

SELECT current_database();
SELECT inet_server_addr();

SELECT column_name, is_nullable
FROM information_schema.columns
WHERE table_schema='public' AND table_name='ledger_entries' AND column_name='order_id';

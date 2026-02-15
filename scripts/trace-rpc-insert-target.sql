-- TRACE REAL INSERT TARGET (Supabase SQL Editor)

-- PHASE 1: rpc_execute_dividend 함수 정의
SELECT pg_get_functiondef('public.rpc_execute_dividend(uuid)'::regprocedure);

-- PHASE 2: ledger_entries 객체 OID
SELECT c.oid, c.relname, n.nspname, c.relkind
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relname = 'ledger_entries';

-- PHASE 3: 동일 이름 테이블 전수 검색
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_name = 'ledger_entries';

-- PHASE 4: order_id NOT NULL 실제 걸린 테이블
SELECT table_schema, table_name, is_nullable
FROM information_schema.columns
WHERE column_name = 'order_id'
AND is_nullable = 'NO';

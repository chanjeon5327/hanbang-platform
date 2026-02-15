-- PHASE 1: ledger_entries order_id NOT NULL 진단 (Supabase SQL Editor)

-- 1) ledger_entries 객체 타입 확인
SELECT
  c.relkind,
  CASE c.relkind
    WHEN 'r' THEN 'TABLE'
    WHEN 'v' THEN 'VIEW'
    WHEN 'm' THEN 'MATERIALIZED_VIEW'
    WHEN 'p' THEN 'PARTITIONED_TABLE'
    ELSE c.relkind::text
  END AS kind
FROM pg_class c
JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname='public' AND c.relname='ledger_entries';

-- 2) order_id 컬럼 nullable 상태(ledger_entries 자체)
SELECT column_name, is_nullable, data_type
FROM information_schema.columns
WHERE table_schema='public' AND table_name='ledger_entries' AND column_name='order_id';

-- 3) DB 전체에서 order_id NOT NULL 컬럼 찾기(진짜 타겟 테이블 찾기)
SELECT table_schema, table_name, is_nullable, data_type
FROM information_schema.columns
WHERE column_name='order_id'
AND is_nullable='NO'
ORDER BY table_schema, table_name;

-- 4) ledger_entries가 VIEW라면 정의 확인(기반 테이블 찾기)
SELECT pg_get_viewdef('public.ledger_entries'::regclass, true) AS view_def;

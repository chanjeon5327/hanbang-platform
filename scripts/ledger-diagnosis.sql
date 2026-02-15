-- PHASE 1: ledger_entries 진단 (Supabase SQL Editor)

-- 1) 컬럼 상태
SELECT column_name, is_nullable
FROM information_schema.columns
WHERE table_schema='public' AND table_name='ledger_entries';

-- 2) NOT NULL 제약 확인
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'public.ledger_entries'::regclass;

-- 3) 트리거 확인
SELECT tgname
FROM pg_trigger
WHERE tgrelid='public.ledger_entries'::regclass
AND NOT tgisinternal;

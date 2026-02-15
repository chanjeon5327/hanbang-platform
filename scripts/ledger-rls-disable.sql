-- LEDGER RLS DISABLE (Supabase SQL Editor)

-- PHASE 1: RLS 상태 확인
SELECT relrowsecurity
FROM pg_class
WHERE oid='public.ledger_entries'::regclass;

-- PHASE 2: RLS 임시 비활성화
ALTER TABLE public.ledger_entries DISABLE ROW LEVEL SECURITY;

-- PHASE 4: 성공 시 재구성
-- ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS ledger_service_insert ON public.ledger_entries;
-- CREATE POLICY ledger_service_insert ON public.ledger_entries FOR INSERT TO service_role WITH CHECK (true);

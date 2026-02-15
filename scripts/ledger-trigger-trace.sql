-- LEDGER TRIGGER TRACE + TEMP DISABLE (Supabase SQL Editor)

-- PHASE 1: ledger_entries 트리거 목록
SELECT tgname,
       pg_get_triggerdef(oid)
FROM pg_trigger
WHERE tgrelid = 'public.ledger_entries'::regclass
AND NOT tgisinternal;

-- PHASE 2: 트리거 임시 비활성화
ALTER TABLE public.ledger_entries DISABLE TRIGGER ALL;

-- PHASE 4: 성공 시 트리거 재활성화
-- ALTER TABLE public.ledger_entries ENABLE TRIGGER ALL;

-- PHASE 1: ledger_entries PK 진단 (Supabase SQL Editor)

SELECT conname, contype, pg_get_constraintdef(oid) AS def
FROM pg_constraint
WHERE conrelid='public.ledger_entries'::regclass
ORDER BY contype, conname;

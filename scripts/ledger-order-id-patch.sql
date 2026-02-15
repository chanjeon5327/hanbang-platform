-- PHASE 2: order_id 완전 해제 패치 (Supabase SQL Editor)

-- 1) 컬럼 레벨 NOT NULL 강제 제거
ALTER TABLE public.ledger_entries
ALTER COLUMN order_id DROP NOT NULL;

-- 2) CHECK 제약이 있으면 제거
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid='public.ledger_entries'::regclass
    AND pg_get_constraintdef(oid) ILIKE '%order_id%'
  LOOP
    EXECUTE 'ALTER TABLE public.ledger_entries DROP CONSTRAINT '||r.conname;
  END LOOP;
END$$;

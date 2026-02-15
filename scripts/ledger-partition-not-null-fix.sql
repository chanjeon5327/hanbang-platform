-- LEDGER PARTITION NOT NULL FIX (Supabase SQL Editor)

-- PHASE 1: ledger_entries partition 확인
SELECT relkind
FROM pg_class
WHERE oid = 'public.ledger_entries'::regclass;

-- PHASE 2: child partition 찾기
SELECT inhrelid::regclass AS child_table
FROM pg_inherits
WHERE inhparent = 'public.ledger_entries'::regclass;

-- PHASE 3: 모든 partition에서 order_id DROP NOT NULL
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT inhrelid::regclass AS child_table
    FROM pg_inherits
    WHERE inhparent = 'public.ledger_entries'::regclass
  LOOP
    EXECUTE 'ALTER TABLE '||r.child_table||' ALTER COLUMN order_id DROP NOT NULL';
  END LOOP;
END$$;

-- PHASE 4: 부모 테이블
ALTER TABLE public.ledger_entries
ALTER COLUMN order_id DROP NOT NULL;

-- PHASE 5: 최종 검증
SELECT table_name, is_nullable
FROM information_schema.columns
WHERE column_name='order_id'
AND table_schema='public';

-- LEDGER ORDER_ID NULLABLE — ONE-SHOT DB SURGERY (Supabase SQL Editor)

BEGIN;

-- 1) id 컬럼 확보
ALTER TABLE public.ledger_entries ADD COLUMN IF NOT EXISTS id uuid;
UPDATE public.ledger_entries SET id = gen_random_uuid() WHERE id IS NULL;
ALTER TABLE public.ledger_entries ALTER COLUMN id SET NOT NULL;

-- 2) 기존 PK 제거
DO $$
DECLARE pkname text;
BEGIN
  SELECT conname INTO pkname
  FROM pg_constraint
  WHERE conrelid='public.ledger_entries'::regclass AND contype='p'
  LIMIT 1;
  IF pkname IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.ledger_entries DROP CONSTRAINT '||quote_ident(pkname);
  END IF;
END$$;

-- 3) 새 PK (id)
ALTER TABLE public.ledger_entries ADD CONSTRAINT ledger_entries_pkey PRIMARY KEY (id);

-- 4) child partition order_id DROP NOT NULL
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT inhrelid::regclass AS child_table
    FROM pg_inherits
    WHERE inhparent = 'public.ledger_entries'::regclass
  LOOP
    BEGIN
      EXECUTE 'ALTER TABLE '||r.child_table||' ALTER COLUMN order_id DROP NOT NULL';
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END LOOP;
END$$;

-- 5) 부모 order_id DROP NOT NULL
ALTER TABLE public.ledger_entries ALTER COLUMN order_id DROP NOT NULL;

COMMIT;

-- 검증 1
SELECT column_name, is_nullable
FROM information_schema.columns
WHERE table_schema='public' AND table_name='ledger_entries' AND column_name IN ('order_id','id');

-- 검증 2
SELECT table_name, is_nullable
FROM information_schema.columns
WHERE column_name='order_id' AND table_schema='public';

-- 검증 3
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid='public.ledger_entries'::regclass AND contype='p';

-- 실행 후 로컬에서:
-- node scripts/run-dividend-force-position.mjs

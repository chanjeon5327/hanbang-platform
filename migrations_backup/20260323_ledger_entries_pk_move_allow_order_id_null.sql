-- LEDGER PK SURGERY: id PK 확정, order_id NULL 허용

-- 1) id 컬럼 없으면 추가
ALTER TABLE public.ledger_entries ADD COLUMN IF NOT EXISTS id uuid;

-- 2) id null인 row 채움
UPDATE public.ledger_entries SET id = gen_random_uuid() WHERE id IS NULL;

-- 3) id NOT NULL 강제
ALTER TABLE public.ledger_entries ALTER COLUMN id SET NOT NULL;

-- 4) 기존 PK 제거
DO $$
DECLARE pkname text;
BEGIN
  SELECT conname INTO pkname
  FROM pg_constraint
  WHERE conrelid='public.ledger_entries'::regclass
    AND contype='p'
  LIMIT 1;

  IF pkname IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.ledger_entries DROP CONSTRAINT '||quote_ident(pkname);
  END IF;
END$$;

-- 5) 새 PK 생성
ALTER TABLE public.ledger_entries ADD CONSTRAINT ledger_entries_pkey PRIMARY KEY (id);

-- 6) order_id NULL 허용
ALTER TABLE public.ledger_entries ALTER COLUMN order_id DROP NOT NULL;

-- 7) 검증
SELECT column_name, is_nullable
FROM information_schema.columns
WHERE table_schema='public' AND table_name='ledger_entries' AND column_name IN ('order_id','id');

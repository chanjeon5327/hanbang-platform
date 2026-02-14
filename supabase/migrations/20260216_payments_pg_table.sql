-- payments 테이블 PG 대응 (기존 있으면 보강, 없으면 생성)

BEGIN;

-- 기존 payments가 payment_status enum 사용 시 대체
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id uuid REFERENCES public.content_items(id) ON DELETE SET NULL,
  amount bigint NOT NULL,
  pg_provider text,
  pg_transaction_id text,
  status text NOT NULL DEFAULT 'INIT',
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 기존 테이블 있으면 컬럼 추가
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS content_id uuid REFERENCES public.content_items(id) ON DELETE SET NULL;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS pg_provider text;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS approved_at timestamptz;

-- amount가 numeric이면 bigint로 변경 (기존 데이터 유지)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='payments' AND column_name='amount' AND data_type='numeric') THEN
    ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS amount_new bigint;
    UPDATE public.payments SET amount_new = amount::bigint WHERE amount_new IS NULL;
    ALTER TABLE public.payments DROP COLUMN IF EXISTS amount;
    ALTER TABLE public.payments RENAME COLUMN amount_new TO amount;
    ALTER TABLE public.payments ALTER COLUMN amount SET NOT NULL;
  END IF;
END $$;

-- status가 enum이면 text로
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns c JOIN information_schema.tables t ON c.table_name=t.table_name
    WHERE c.table_schema='public' AND c.table_name='payments' AND c.column_name='status')
    AND (SELECT data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='payments' AND column_name='status') = 'USER-DEFINED'
  THEN
    ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS status_text text DEFAULT 'INIT';
    UPDATE public.payments SET status_text = COALESCE(status::text, 'INIT') WHERE status_text IS NULL;
    ALTER TABLE public.payments DROP COLUMN status;
    ALTER TABLE public.payments RENAME COLUMN status_text TO status;
    ALTER TABLE public.payments ALTER COLUMN status SET DEFAULT 'INIT';
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_payments_order ON public.payments (order_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payments (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_pg_transaction_id ON public.payments (pg_transaction_id) WHERE pg_transaction_id IS NOT NULL;

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payments_select_own" ON public.payments;
CREATE POLICY "payments_select_own" ON public.payments FOR SELECT USING (auth.uid() = user_id);

-- insert/update는 service_role만 (RLS bypass)
DROP POLICY IF EXISTS "payments_insert_service" ON public.payments;
-- RLS로 authenticated insert 차단 시 service_role은 bypass

COMMIT;

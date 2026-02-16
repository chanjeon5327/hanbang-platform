-- orders.status ENUM 6단계 고정 (PG 결제 플로우)
-- INIT → PAYMENT_REQUESTED → PAYMENT_APPROVED → INVEST_CONFIRMED → SETTLED
-- CANCELLED (어디서든)

BEGIN;

-- 1) 신규 order_status_v3 enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status_v3') THEN
    CREATE TYPE order_status_v3 AS ENUM (
      'INIT',
      'PAYMENT_REQUESTED',
      'PAYMENT_APPROVED',
      'INVEST_CONFIRMED',
      'SETTLED',
      'CANCELLED'
    );
  END IF;
END $$;

-- 2) orders에 status_new 컬럼 추가 및 backfill
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status_new order_status_v3;

UPDATE public.orders SET status_new = CASE UPPER(COALESCE(status::text, ''))
  WHEN 'CREATED' THEN 'INIT'::order_status_v3
  WHEN 'PENDING' THEN 'PAYMENT_REQUESTED'::order_status_v3
  WHEN 'INIT' THEN 'INIT'::order_status_v3
  WHEN 'PAYMENT_REQUESTED' THEN 'PAYMENT_REQUESTED'::order_status_v3
  WHEN 'PAID' THEN 'PAYMENT_APPROVED'::order_status_v3
  WHEN 'PAYMENT_APPROVED' THEN 'PAYMENT_APPROVED'::order_status_v3
  WHEN 'COMPLETED' THEN 'INVEST_CONFIRMED'::order_status_v3
  WHEN 'INVEST_CONFIRMED' THEN 'INVEST_CONFIRMED'::order_status_v3
  WHEN 'SETTLED' THEN 'SETTLED'::order_status_v3
  WHEN 'CANCELLED' THEN 'CANCELLED'::order_status_v3
  WHEN 'FAILED' THEN 'CANCELLED'::order_status_v3
  WHEN 'REFUNDED' THEN 'CANCELLED'::order_status_v3
  ELSE 'INIT'::order_status_v3
END
WHERE status_new IS NULL;

ALTER TABLE public.orders ALTER COLUMN status_new SET DEFAULT 'INIT'::order_status_v3;
ALTER TABLE public.orders ALTER COLUMN status_new SET NOT NULL;

-- 3) 기존 status 제거, status_new → status
ALTER TABLE public.orders DROP COLUMN IF EXISTS status;
ALTER TABLE public.orders RENAME COLUMN status_new TO status;

-- 4) 기존 order_status 타입 제거 후 v3를 order_status로
DROP TYPE IF EXISTS order_status CASCADE;
ALTER TYPE order_status_v3 RENAME TO order_status;

-- 5) set_config 플래그 사용하는 트리거가 status 컬럼을 참조하므로 재생성 불필요
--    (컬럼명 status 유지)

COMMIT;

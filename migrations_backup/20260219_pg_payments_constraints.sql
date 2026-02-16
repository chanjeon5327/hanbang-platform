-- PG 실전 연결 대비: payments 제약 강화

-- PAYMENT_APPROVED/INVEST_CONFIRMED 시 pg_transaction_id 필수
ALTER TABLE public.payments
DROP CONSTRAINT IF EXISTS chk_payments_approved_has_tx;

ALTER TABLE public.payments
ADD CONSTRAINT chk_payments_approved_has_tx
CHECK (
  status NOT IN ('PAYMENT_APPROVED', 'INVEST_CONFIRMED')
  OR pg_transaction_id IS NOT NULL
);

-- 중복 승인 방지: pg_transaction_id unique (이미 존재)
-- idx_payments_pg_transaction_id UNIQUE WHERE pg_transaction_id IS NOT NULL

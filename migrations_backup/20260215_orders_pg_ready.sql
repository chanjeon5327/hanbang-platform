-- PG 실전 대비: idempotency_key, unique 제약, double-spend 방지

BEGIN;

-- 1) idempotency_key 컬럼 추가
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS idempotency_key text;

-- 2) unique: 동일 idempotency_key 중복 방지
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_idempotency_key
  ON public.orders (idempotency_key)
  WHERE idempotency_key IS NOT NULL AND idempotency_key <> '';

-- 3) double-spend 방지: (user_id, content_id) 동시 PAID/COMPLETED 1건 제한은 하지 않음
--    (동일 콘텐츠에 여러 번 투자 가능하므로)
--    idempotency_key로 동일 요청 중복 처리만 방지

COMMIT;

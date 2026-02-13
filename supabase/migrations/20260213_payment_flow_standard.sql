-- ============================================================
-- 결제 상태전이 표준 (v1)
-- 목표: 전액 환불만 허용, 부분 환불 없음
-- ============================================================
-- 개발 가이드:
--   PENDING → PAID → COMPLETED → SETTLED
--   PAID 상태에서만 원장 반영 가능
--   REFUNDED는 전액 환불만 허용
--   부분 환불 없음 (v1 정책)
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 1) ENUM 생성 (없으면 생성)
-- ------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM (
    'PENDING',
    'PAID',
    'FAILED',
    'CANCELLED',
    'COMPLETED',
    'REFUNDED',
    'SETTLED'
  );
EXCEPTION WHEN duplicate_object THEN
  -- 기존 order_status가 있으면 새 타입으로 교체 (마이그레이션)
  NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM (
    'INIT',
    'APPROVED',
    'DECLINED',
    'CANCELLED',
    'REFUNDED'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE refund_status AS ENUM (
    'REQUESTED',
    'APPROVED',
    'REJECTED',
    'DONE'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE content_status AS ENUM (
    'DRAFT',
    'PENDING_REVIEW',
    'MOBILIZING',
    'MOBILIZED',
    'TRADABLE',
    'SUSPENDED',
    'DELISTED'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ------------------------------------------------------------
-- 1b) order_status 마이그레이션 (기존 소문자 enum → 신규 대문자)
--     기존 order_status가 다른 값이면 교체
-- ------------------------------------------------------------

DO $$
DECLARE
  v_has_old_enum boolean;
BEGIN
  -- pg_enum에서 기존 order_status 값 확인 (소문자 존재 여부)
  SELECT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'order_status' AND e.enumlabel IN ('pending','paid','created','completed')
  ) INTO v_has_old_enum;

  IF v_has_old_enum THEN
    -- 신규 타입 생성 (임시 이름)
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status_v2') THEN
      CREATE TYPE order_status_v2 AS ENUM (
        'PENDING','PAID','FAILED','CANCELLED','COMPLETED','REFUNDED','SETTLED'
      );
    END IF;

    -- 컬럼 추가 및 마이그레이션
    ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status_new order_status_v2;
    UPDATE public.orders SET status_new = CASE status::text
      WHEN 'created' THEN 'PENDING'::order_status_v2
      WHEN 'pending' THEN 'PENDING'::order_status_v2
      WHEN 'paid' THEN 'PAID'::order_status_v2
      WHEN 'completed' THEN 'COMPLETED'::order_status_v2
      WHEN 'cancelled' THEN 'CANCELLED'::order_status_v2
      WHEN 'failed' THEN 'FAILED'::order_status_v2
      WHEN 'refunded' THEN 'REFUNDED'::order_status_v2
      ELSE 'PENDING'::order_status_v2
    END
    WHERE status_new IS NULL;

    ALTER TABLE public.orders ALTER COLUMN status_new SET DEFAULT 'PENDING'::order_status_v2;
    ALTER TABLE public.orders DROP COLUMN IF EXISTS status;
    ALTER TABLE public.orders RENAME COLUMN status_new TO status;
    ALTER TABLE public.orders ALTER COLUMN status SET NOT NULL;

    DROP TYPE IF EXISTS order_status CASCADE;
    ALTER TYPE order_status_v2 RENAME TO order_status;
  ELSE
    -- 이미 대문자 enum이거나 신규 설치: status 컬럼 only 정리
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='status') THEN
      BEGIN
        ALTER TABLE public.orders ALTER COLUMN status SET DEFAULT 'PENDING';
      EXCEPTION WHEN OTHERS THEN
        NULL; -- enum 타입 불일치 시 1b 블록에서 처리됨
      END;
    END IF;
  END IF;
END $$;

-- ------------------------------------------------------------
-- 2) orders 테이블 정리
-- ------------------------------------------------------------

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_id uuid;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_payment_id_unique
  ON public.orders(payment_id) WHERE payment_id IS NOT NULL;

-- 기본값 확정 (마이그레이션 후)
ALTER TABLE public.orders
  ALTER COLUMN status SET DEFAULT 'PENDING'::order_status;

-- ------------------------------------------------------------
-- 3) payments 테이블 생성
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  pg_transaction_id text UNIQUE,
  status payment_status NOT NULL DEFAULT 'INIT',
  amount numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

-- ------------------------------------------------------------
-- 4) refunds 테이블 생성
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  status refund_status NOT NULL DEFAULT 'REQUESTED',
  amount numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_refunds_order_id ON public.refunds(order_id);

-- ------------------------------------------------------------
-- 5) ledger_entries 멱등 보호
-- ------------------------------------------------------------

CREATE UNIQUE INDEX IF NOT EXISTS idx_ledger_order_entry
  ON public.ledger_entries(order_id, entry_type)
  WHERE order_id IS NOT NULL;

-- ------------------------------------------------------------
-- 6) content_items 테이블 status → content_status
--     (contents 대신 content_items 사용 - 실제 존재 테이블)
-- ------------------------------------------------------------

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='content_items') THEN
    -- content_status enum으로 신규 컬럼 추가 후 마이그레이션
    ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS status_new content_status;
    UPDATE public.content_items SET status_new = CASE LOWER(COALESCE(status,''))
      WHEN 'draft' THEN 'DRAFT'::content_status
      WHEN 'pending_review' THEN 'PENDING_REVIEW'::content_status
      WHEN 'mobilizing' THEN 'MOBILIZING'::content_status
      WHEN 'mobilized' THEN 'MOBILIZED'::content_status
      WHEN 'tradable' THEN 'TRADABLE'::content_status
      WHEN 'suspended' THEN 'SUSPENDED'::content_status
      WHEN 'delisted' THEN 'DELISTED'::content_status
      WHEN 'active' THEN 'TRADABLE'::content_status
      WHEN 'hidden' THEN 'SUSPENDED'::content_status
      ELSE 'DRAFT'::content_status
    END
    WHERE status_new IS NULL;

    ALTER TABLE public.content_items DROP COLUMN IF EXISTS status;
    ALTER TABLE public.content_items RENAME COLUMN status_new TO status;
    ALTER TABLE public.content_items ALTER COLUMN status SET DEFAULT 'DRAFT'::content_status;
    ALTER TABLE public.content_items ALTER COLUMN status SET NOT NULL;
  END IF;
END $$;

-- v_content_metrics_7d 뷰: status 'active' → 'TRADABLE'
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_views WHERE schemaname='public' AND viewname='v_content_metrics_7d') THEN
    CREATE OR REPLACE VIEW public.v_content_metrics_7d AS
    SELECT ci.id AS content_id,
      coalesce(sum(cmd.impressions),0) AS impressions_7d,
      coalesce(sum(cmd.clicks),0) AS clicks_7d,
      coalesce(sum(cmd.interests),0) AS interests_7d,
      coalesce(sum(cmd.watch_seconds),0) AS watch_seconds_7d
    FROM public.content_items ci
    LEFT JOIN public.content_metrics_daily cmd ON cmd.content_id = ci.id AND cmd.day >= (current_date - interval '6 day')
    WHERE ci.status = 'TRADABLE'
    GROUP BY ci.id;
  END IF;
END $$;

-- ------------------------------------------------------------
-- 7) 트리거 함수 업데이트 (COMPLETED 대문자)
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.tg_post_ledger_on_order_completed()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_user uuid;
  v_asset uuid;
  v_cash numeric(18,2);
  v_qty numeric(18,6);
  v_status_text text;
BEGIN
  v_status_text := new.status::text;
  IF (tg_op = 'UPDATE') AND (old.status IS DISTINCT FROM new.status) AND (v_status_text = 'COMPLETED') THEN
    IF new.ledger_posted_at IS NOT NULL THEN
      RETURN new;
    END IF;

    v_user := new.buyer_id;
    v_asset := coalesce(new.product_id, (new.metadata->>'asset_id')::uuid);
    v_cash := coalesce(new.total_amount_krw, 0);
    v_qty  := coalesce(new.quantity, 0);

    INSERT INTO public.ledger_entries (
      user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata
    ) VALUES (
      v_user, new.id, 'CASH_DEBIT', 'KRW', (v_cash * -1), null, 0,
      'Order completed: cash debit',
      jsonb_build_object('source', 'order', 'status', v_status_text)
    );

    INSERT INTO public.ledger_entries (
      user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata
    ) VALUES (
      v_user, new.id, 'ASSET_CREDIT', 'KRW', 0, v_asset, v_qty,
      'Order completed: asset credit',
      jsonb_build_object('source', 'order', 'status', v_status_text)
    );

    new.ledger_posted_at := now();
    IF new.completed_at IS NULL THEN
      new.completed_at := now();
    END IF;
  END IF;
  RETURN new;
END;
$$;

-- ------------------------------------------------------------
-- 8) RPC 함수 상태값 업데이트 (COMPLETED, PENDING)
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.rpc_confirm_payment(
  p_order_id uuid,
  p_amount_krw numeric,
  p_transaction_id text DEFAULT NULL,
  p_payment_method text DEFAULT 'card'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.orders%ROWTYPE;
BEGIN
  SELECT * INTO v_row FROM public.orders WHERE id = p_order_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'ORDER_NOT_FOUND: 주문을 찾을 수 없습니다.';
  END IF;

  IF v_row.status IN ('PAID', 'COMPLETED') THEN
    RETURN jsonb_build_object('ok', true, 'order_id', p_order_id, 'status', v_row.status, 'idempotent', true);
  END IF;

  IF v_row.status NOT IN ('PENDING') THEN
    RAISE EXCEPTION 'INVALID_STATUS: 현재 상태(%)에서는 결제 확정이 불가합니다.', v_row.status::text;
  END IF;

  IF ABS(COALESCE(v_row.total_amount_krw, 0) - p_amount_krw) > 0.01 THEN
    RAISE EXCEPTION 'AMOUNT_MISMATCH: 주문금액(%)과 결제금액(%)이 일치하지 않습니다.',
      v_row.total_amount_krw, p_amount_krw;
  END IF;

  -- PENDING → PAID(결제확정) → COMPLETED(원장반영) - v1: PG콜백에서 한번에 COMPLETED까지
  UPDATE public.orders
  SET
    status = 'COMPLETED',
    paid_at = COALESCE(paid_at, now()),
    completed_at = COALESCE(completed_at, now()),
    transaction_id = COALESCE(transaction_id, p_transaction_id),
    payment_method = COALESCE(payment_method, p_payment_method),
    metadata = jsonb_set(
      COALESCE(metadata, '{}'::jsonb),
      '{pg_callback}',
      jsonb_build_object('transaction_id', p_transaction_id, 'confirmed_at', now())
    )
  WHERE id = p_order_id;

  RETURN jsonb_build_object('ok', true, 'order_id', p_order_id, 'status', 'COMPLETED');
END;
$$;

CREATE OR REPLACE FUNCTION public.rpc_place_order(
  p_product_id uuid,
  p_side text DEFAULT 'BUY',
  p_price numeric DEFAULT 0,
  p_quantity numeric DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_buyer_id uuid;
  v_order_id uuid;
  v_total numeric;
BEGIN
  v_buyer_id := auth.uid();
  IF v_buyer_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: 로그인이 필요합니다.';
  END IF;

  IF p_quantity IS NULL OR p_quantity <= 0 THEN
    RAISE EXCEPTION '수량은 1 이상이어야 합니다.';
  END IF;
  IF p_price IS NULL OR p_price < 0 THEN
    RAISE EXCEPTION '가격이 올바르지 않습니다.';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.products WHERE id = p_product_id) THEN
    RAISE EXCEPTION '존재하지 않는 상품입니다.';
  END IF;

  IF p_side IS DISTINCT FROM 'BUY' THEN
    RAISE EXCEPTION '현재 매수만 지원합니다.';
  END IF;

  v_total := p_price * p_quantity;

  INSERT INTO public.orders (
    buyer_id, product_id, status, total_amount_krw, quantity, metadata
  ) VALUES (
    v_buyer_id, p_product_id, 'PENDING', v_total, p_quantity,
    jsonb_build_object('side', p_side, 'price_per_unit', p_price)
  )
  RETURNING id INTO v_order_id;

  RETURN jsonb_build_object('id', v_order_id, 'status', 'PENDING', 'total_amount_krw', v_total, 'quantity', p_quantity);
END;
$$;

-- transition_order_status (1b에서 CASCADE로 drop된 경우 재생성)
CREATE OR REPLACE FUNCTION public.transition_order_status(
  _order_id uuid,
  _next_status order_status
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_status order_status;
BEGIN
  SELECT status INTO current_status FROM public.orders WHERE id = _order_id;
  IF current_status IS NULL THEN
    RAISE EXCEPTION 'ORDER_NOT_FOUND';
  END IF;

  IF current_status = 'PENDING' AND _next_status = 'PAID' THEN NULL;
  ELSIF current_status = 'PAID' AND _next_status IN ('COMPLETED', 'CANCELLED') THEN NULL;
  ELSIF current_status = 'COMPLETED' AND _next_status = 'REFUNDED' THEN NULL;
  ELSIF current_status = 'COMPLETED' AND _next_status = 'SETTLED' THEN NULL;
  ELSE
    RAISE EXCEPTION 'INVALID_STATUS_TRANSITION: % -> %', current_status, _next_status;
  END IF;

  UPDATE public.orders SET status = _next_status WHERE id = _order_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_confirm_payment(uuid, numeric, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.rpc_place_order(uuid, text, numeric, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_place_order(uuid, text, numeric, numeric) TO service_role;

COMMIT;

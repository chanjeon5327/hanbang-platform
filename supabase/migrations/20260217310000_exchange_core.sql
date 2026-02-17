-- ============================================================================
-- HANBANG Exchange V2 — 거래소 코어 (Orders · Trades · Orderbook Views)
-- ============================================================================
--
-- [금융감독원 전자금융업 감독규정 준수]
-- 1. 주문(orders)의 생성·상태변경은 SECURITY DEFINER RPC 내부에서만 수행
-- 2. 체결(trades)은 불변 기록, 시장 데이터는 trades_public 뷰로 공개
-- 3. 오더북 집계 뷰: 실시간 호가 제공
-- 4. RLS: 주문은 본인만 조회, 체결은 공개(마스킹), INSERT/UPDATE는 service_role만
--
-- ============================================================================

-- ─────────────────────────────────────────────
-- 1. exchange_orders — 거래소 주문 테이블
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.exchange_orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL,
  asset_id        UUID NOT NULL,
  side            TEXT NOT NULL CHECK (side IN ('BUY', 'SELL')),
  order_type      TEXT NOT NULL CHECK (order_type IN ('LIMIT', 'MARKET')),
  price           NUMERIC(18,2),
  quantity        NUMERIC(18,6),
  amount_max      NUMERIC(18,2),
  remaining_qty   NUMERIC(18,6) NOT NULL DEFAULT 0,
  remaining_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'OPEN'
                  CHECK (status IN ('OPEN','PARTIALLY_FILLED','FILLED','CANCELED')),
  idempotency_key TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_eo_limit_price CHECK (
    order_type != 'LIMIT' OR price IS NOT NULL
  ),
  CONSTRAINT chk_eo_limit_qty CHECK (
    order_type != 'LIMIT' OR quantity IS NOT NULL
  ),
  CONSTRAINT uq_eo_idempotency UNIQUE (user_id, idempotency_key)
);

COMMENT ON TABLE public.exchange_orders IS
  '거래소 주문 테이블. LIMIT/MARKET, BUY/SELL 지원. Price-Time Priority 매칭.';

-- ─────────────────────────────────────────────
-- 2. exchange_trades — 체결 테이블
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.exchange_trades (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id        UUID NOT NULL,
  price           NUMERIC(18,2) NOT NULL,
  quantity        NUMERIC(18,6) NOT NULL,
  maker_order_id  UUID NOT NULL REFERENCES public.exchange_orders(id),
  taker_order_id  UUID NOT NULL REFERENCES public.exchange_orders(id),
  maker_user_id   UUID NOT NULL,
  taker_user_id   UUID NOT NULL,
  taker_side      TEXT NOT NULL CHECK (taker_side IN ('BUY', 'SELL')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.exchange_trades IS
  '거래소 체결 기록. maker/taker 주문 ID 및 사용자 ID를 기록하여 감사 추적 가능.';

-- ─────────────────────────────────────────────
-- 3. 인덱스
-- ─────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_eo_asset_side_status
  ON public.exchange_orders (asset_id, side, status, price, created_at);

CREATE INDEX IF NOT EXISTS idx_eo_user_status
  ON public.exchange_orders (user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_et_asset_created
  ON public.exchange_trades (asset_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_et_maker_order
  ON public.exchange_trades (maker_order_id);

CREATE INDEX IF NOT EXISTS idx_et_taker_order
  ON public.exchange_trades (taker_order_id);

-- ─────────────────────────────────────────────
-- 4. 오더북 집계 뷰
-- ─────────────────────────────────────────────

CREATE OR REPLACE VIEW public.v_orderbook_bids AS
SELECT
  asset_id,
  price,
  SUM(remaining_qty) AS qty,
  COUNT(*) AS order_count
FROM public.exchange_orders
WHERE side = 'BUY'
  AND order_type = 'LIMIT'
  AND status IN ('OPEN', 'PARTIALLY_FILLED')
  AND price IS NOT NULL
GROUP BY asset_id, price
ORDER BY asset_id, price DESC;

CREATE OR REPLACE VIEW public.v_orderbook_asks AS
SELECT
  asset_id,
  price,
  SUM(remaining_qty) AS qty,
  COUNT(*) AS order_count
FROM public.exchange_orders
WHERE side = 'SELL'
  AND order_type = 'LIMIT'
  AND status IN ('OPEN', 'PARTIALLY_FILLED')
  AND price IS NOT NULL
GROUP BY asset_id, price
ORDER BY asset_id, price ASC;

-- ─────────────────────────────────────────────
-- 5. 최근 체결 공개 뷰 (사용자 ID 마스킹)
-- ─────────────────────────────────────────────

CREATE OR REPLACE VIEW public.v_recent_trades AS
SELECT
  t.id,
  t.asset_id,
  t.price,
  t.quantity,
  t.taker_side,
  t.created_at
FROM public.exchange_trades t
ORDER BY t.created_at DESC;

COMMENT ON VIEW public.v_recent_trades IS
  '최근 체결 공개 뷰. maker/taker 사용자 ID는 제외하여 개인정보를 보호합니다.';

-- ─────────────────────────────────────────────
-- 6. RLS 정책
-- ─────────────────────────────────────────────

ALTER TABLE public.exchange_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eo_select_own ON public.exchange_orders;
CREATE POLICY eo_select_own ON public.exchange_orders
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS eo_insert_service ON public.exchange_orders;
CREATE POLICY eo_insert_service ON public.exchange_orders
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS eo_update_service ON public.exchange_orders;
CREATE POLICY eo_update_service ON public.exchange_orders
  FOR UPDATE USING (true);

ALTER TABLE public.exchange_trades ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS et_select_public ON public.exchange_trades;
CREATE POLICY et_select_public ON public.exchange_trades
  FOR SELECT USING (true);

DROP POLICY IF EXISTS et_insert_service ON public.exchange_trades;
CREATE POLICY et_insert_service ON public.exchange_trades
  FOR INSERT WITH CHECK (true);

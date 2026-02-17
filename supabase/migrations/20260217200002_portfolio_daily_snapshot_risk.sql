-- ============================================================================
-- HANBANG Financial Engine V1 — 리스크 엔진 (MDD + Rolling Return)
-- ============================================================================
--
-- [금융감독원 전자금융업 감독규정 준수 사항]
-- 1. 투자자 보호를 위한 포트폴리오 리스크 지표 관리
-- 2. 일별 자산가치 스냅샷(equity snapshot) 기록
-- 3. MDD(Maximum Drawdown, 최대 낙폭) 산정
-- 4. Rolling 30일/90일 수익률 산정
-- 5. 투자자별 리스크 프로파일 제공
--
-- MDD 산정 공식:
--   MDD = (저점 equity - 고점 equity) / 고점 equity × 100
--   여기서 고점은 관측 기간 내 최고 equity, 저점은 고점 이후 최저 equity
--
-- Rolling 수익률 공식:
--   30D Return = (오늘 equity - 30일 전 equity) / 30일 전 equity × 100
--   90D Return = (오늘 equity - 90일 전 equity) / 90일 전 equity × 100
--
-- ============================================================================

-- ─────────────────────────────────────────────
-- 1. 일별 포트폴리오 스냅샷 테이블
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.portfolio_daily_snapshot (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL,
  /** 스냅샷 기준 날짜 (UTC, YYYY-MM-DD) */
  snapshot_date DATE NOT NULL,
  /** 총 자산 가치 = cash_balance + asset_value */
  equity        NUMERIC(18,2) NOT NULL DEFAULT 0,
  /** 현금 잔고 (KRW) */
  cash_balance  NUMERIC(18,2) NOT NULL DEFAULT 0,
  /** 보유 자산 시가 합계 (KRW) */
  asset_value   NUMERIC(18,2) NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_snapshot_user_date UNIQUE (user_id, snapshot_date)
);

COMMENT ON TABLE public.portfolio_daily_snapshot IS
  '투자자별 일별 포트폴리오 스냅샷. MDD 및 Rolling Return 산정의 기초 데이터입니다.';

-- ─────────────────────────────────────────────
-- 2. RLS 정책
-- ─────────────────────────────────────────────

ALTER TABLE public.portfolio_daily_snapshot ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS snapshot_select_own ON public.portfolio_daily_snapshot;
CREATE POLICY snapshot_select_own ON public.portfolio_daily_snapshot
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS snapshot_insert_service ON public.portfolio_daily_snapshot;
CREATE POLICY snapshot_insert_service ON public.portfolio_daily_snapshot
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS snapshot_update_service ON public.portfolio_daily_snapshot;
CREATE POLICY snapshot_update_service ON public.portfolio_daily_snapshot
  FOR UPDATE USING (true);

-- ─────────────────────────────────────────────
-- 3. MDD 계산 SQL VIEW
-- ─────────────────────────────────────────────
-- 사용자별 전체 기간 MDD를 계산합니다.
-- running maximum → drawdown → 최대 drawdown 추출

CREATE OR REPLACE VIEW public.v_portfolio_mdd AS
WITH daily AS (
  SELECT
    user_id,
    snapshot_date,
    equity,
    -- 해당 일자까지의 누적 최대 equity (고점)
    MAX(equity) OVER (
      PARTITION BY user_id
      ORDER BY snapshot_date
      ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS running_peak
  FROM public.portfolio_daily_snapshot
),
drawdowns AS (
  SELECT
    user_id,
    snapshot_date,
    equity,
    running_peak,
    -- 낙폭 (%) = (현재 equity - 고점) / 고점 × 100
    CASE
      WHEN running_peak > 0
      THEN (equity - running_peak) / running_peak * 100
      ELSE 0
    END AS drawdown_pct
  FROM daily
),
mdd_per_user AS (
  SELECT
    user_id,
    -- MDD: 전 기간 중 최소 drawdown (가장 큰 낙폭, 음수)
    MIN(drawdown_pct) AS mdd_pct,
    -- MDD 발생 일자 (저점)
    (ARRAY_AGG(snapshot_date ORDER BY drawdown_pct ASC))[1] AS trough_date,
    (ARRAY_AGG(equity ORDER BY drawdown_pct ASC))[1]        AS trough_equity
  FROM drawdowns
  GROUP BY user_id
)
SELECT
  m.user_id,
  m.mdd_pct,
  m.trough_date,
  m.trough_equity,
  -- 고점 일자: 저점 이전의 최고 equity 일자
  (
    SELECT d.snapshot_date
    FROM public.portfolio_daily_snapshot d
    WHERE d.user_id = m.user_id
      AND d.snapshot_date <= m.trough_date
    ORDER BY d.equity DESC, d.snapshot_date ASC
    LIMIT 1
  ) AS peak_date,
  (
    SELECT d.equity
    FROM public.portfolio_daily_snapshot d
    WHERE d.user_id = m.user_id
      AND d.snapshot_date <= m.trough_date
    ORDER BY d.equity DESC, d.snapshot_date ASC
    LIMIT 1
  ) AS peak_equity
FROM mdd_per_user m;

COMMENT ON VIEW public.v_portfolio_mdd IS
  '사용자별 MDD(최대 낙폭)를 계산하는 뷰. 금융감독원 투자자 리스크 보고 기준에 따라 산정됩니다.';

-- ─────────────────────────────────────────────
-- 4. Rolling 30일/90일 수익률 VIEW
-- ─────────────────────────────────────────────

CREATE OR REPLACE VIEW public.v_portfolio_rolling_returns AS
WITH latest AS (
  SELECT
    user_id,
    equity AS current_equity,
    snapshot_date AS current_date_snap
  FROM public.portfolio_daily_snapshot
  WHERE (user_id, snapshot_date) IN (
    SELECT user_id, MAX(snapshot_date)
    FROM public.portfolio_daily_snapshot
    GROUP BY user_id
  )
),
d30 AS (
  SELECT DISTINCT ON (user_id)
    user_id,
    equity AS equity_30d
  FROM public.portfolio_daily_snapshot
  WHERE snapshot_date <= (CURRENT_DATE - INTERVAL '30 days')
  ORDER BY user_id, snapshot_date DESC
),
d90 AS (
  SELECT DISTINCT ON (user_id)
    user_id,
    equity AS equity_90d
  FROM public.portfolio_daily_snapshot
  WHERE snapshot_date <= (CURRENT_DATE - INTERVAL '90 days')
  ORDER BY user_id, snapshot_date DESC
)
SELECT
  l.user_id,
  l.current_equity,
  -- 30일 수익률 (%)
  CASE
    WHEN d30.equity_30d IS NOT NULL AND d30.equity_30d > 0
    THEN (l.current_equity - d30.equity_30d) / d30.equity_30d * 100
    ELSE NULL
  END AS return_30d,
  -- 90일 수익률 (%)
  CASE
    WHEN d90.equity_90d IS NOT NULL AND d90.equity_90d > 0
    THEN (l.current_equity - d90.equity_90d) / d90.equity_90d * 100
    ELSE NULL
  END AS return_90d
FROM latest l
LEFT JOIN d30 ON d30.user_id = l.user_id
LEFT JOIN d90 ON d90.user_id = l.user_id;

COMMENT ON VIEW public.v_portfolio_rolling_returns IS
  '사용자별 Rolling 30일/90일 수익률을 산정하는 뷰. portfolio_daily_snapshot 기반.';

-- ─────────────────────────────────────────────
-- 5. 일별 스냅샷 생성 RPC (배치 실행용)
-- ─────────────────────────────────────────────
-- 매일 정기적으로 호출하여 모든 활성 사용자의
-- 당일 equity 스냅샷을 기록합니다.
-- 외부 cron job 또는 Supabase Edge Function에서 호출합니다.

CREATE OR REPLACE FUNCTION public.rpc_create_daily_snapshots()
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_count INT := 0;
  v_today DATE := CURRENT_DATE;
BEGIN
  -- 각 사용자별로 당일 스냅샷 생성 (이미 존재하면 갱신)
  INSERT INTO public.portfolio_daily_snapshot (user_id, snapshot_date, equity, cash_balance, asset_value)
  SELECT
    u.user_id,
    v_today,
    -- equity = cash + asset_value
    COALESCE(u.cash_balance, 0) + COALESCE(a.asset_value, 0),
    COALESCE(u.cash_balance, 0),
    COALESCE(a.asset_value, 0)
  FROM (
    -- 현금 잔고: 원장에서 계산
    SELECT
      le.user_id,
      SUM(
        CASE
          WHEN le.entry_type = 'CASH_CREDIT' THEN ABS(le.amount)
          WHEN le.entry_type = 'CASH_DEBIT'  THEN -ABS(le.amount)
          ELSE 0
        END
      ) AS cash_balance
    FROM public.ledger_entries le
    GROUP BY le.user_id
  ) u
  LEFT JOIN (
    -- 자산 시가: positions × 최근 시세
    SELECT
      p.user_id,
      SUM(p.quantity * COALESCE(
        (SELECT ci.share_price_usd * 1350
         FROM public.content_items ci
         WHERE ci.id = p.asset_id
         LIMIT 1),
        p.avg_price
      )) AS asset_value
    FROM public.positions p
    WHERE p.quantity > 0
    GROUP BY p.user_id
  ) a ON a.user_id = u.user_id
  ON CONFLICT (user_id, snapshot_date)
  DO UPDATE SET
    equity       = EXCLUDED.equity,
    cash_balance = EXCLUDED.cash_balance,
    asset_value  = EXCLUDED.asset_value;

  GET DIAGNOSTICS v_count = ROW_COUNT;

  RETURN jsonb_build_object(
    'ok', true,
    'snapshot_date', v_today::text,
    'users_processed', v_count
  );
END;
$$;

COMMENT ON FUNCTION public.rpc_create_daily_snapshots IS
  '모든 활성 사용자의 일별 포트폴리오 스냅샷을 생성합니다. MDD 및 Rolling Return 산정의 기초 데이터.';

GRANT EXECUTE ON FUNCTION public.rpc_create_daily_snapshots() TO service_role;

-- ─────────────────────────────────────────────
-- 6. 인덱스
-- ─────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_snapshot_user_date
  ON public.portfolio_daily_snapshot (user_id, snapshot_date DESC);

CREATE INDEX IF NOT EXISTS idx_snapshot_date
  ON public.portfolio_daily_snapshot (snapshot_date);

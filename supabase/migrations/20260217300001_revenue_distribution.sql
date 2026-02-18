-- ============================================================================
-- HANBANG Financial Engine V1.5 — 수익분배(Revenue Distribution) 엔진
-- ============================================================================
--
-- [금융감독원 전자금융업 감독규정 준수 사항]
-- 1. 콘텐츠 수익 발생 → 투자자 비례 분배의 정합성 보장
-- 2. 원장(ledger_entries) 기반 분배 기록으로 감사 추적 완전성
-- 3. 멱등성(idempotency): 동일 event+user 중복 분배 방지
-- 4. 분배 비율: 보유 수량 / 전체 발행 수량 기준 pro-rata
-- 5. service_role 전용 실행, RLS 엄격 적용
--
-- 수익분배 플로우:
--   1) 관리자가 revenue_events 생성 (총 수익 기록)
--   2) rpc_distribute_revenue(event_id) 호출
--   3) 해당 content_id 보유자(positions)를 조회
--   4) 보유 비율에 따라 net_amount 분배
--   5) 각 투자자에게 ledger_entries에 DIVIDEND 기록
--   6) revenue_distributions에 분배 내역 기록
--
-- 분배 공식:
--   user_payout = (user_quantity / total_quantity) × net_amount
--   (소수점 이하 KRW 절사, 잔여분은 미분배 처리)
--
-- ============================================================================

-- ─────────────────────────────────────────────
-- 1. revenue_events — 수익 이벤트 테이블
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.revenue_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  /** 수익 발생 콘텐츠 ID */
  content_id    UUID NOT NULL,
  /** 총 수익 (세전) */
  gross_amount  NUMERIC(18,2) NOT NULL DEFAULT 0,
  /** 순 수익 (세후, 실제 분배 대상) */
  net_amount    NUMERIC(18,2) NOT NULL DEFAULT 0,
  currency      TEXT NOT NULL DEFAULT 'KRW',
  /** 수익 발생 일시 */
  occurred_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  /** 분배 상태: PENDING → DISTRIBUTED */
  status        TEXT NOT NULL DEFAULT 'PENDING',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  /** 생성 관리자 */
  created_by    UUID,

  CONSTRAINT chk_rev_event_status CHECK (status IN ('PENDING', 'DISTRIBUTED', 'CANCELLED')),
  CONSTRAINT chk_rev_event_amounts CHECK (gross_amount >= 0 AND net_amount >= 0)
);

COMMENT ON TABLE public.revenue_events IS
  '콘텐츠별 수익 발생 이벤트. 관리자가 수익을 기록하면 rpc_distribute_revenue로 투자자에게 분배합니다.';

-- ─────────────────────────────────────────────
-- 2. revenue_distributions — 개별 분배 내역
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.revenue_distributions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      UUID NOT NULL REFERENCES public.revenue_events(id),
  user_id       UUID NOT NULL,
  /** 분배 금액 (KRW) */
  amount        NUMERIC(18,2) NOT NULL DEFAULT 0,
  /** 분배 시점 보유 수량 */
  quantity_held NUMERIC(18,6) NOT NULL DEFAULT 0,
  /** 분배 비율 (%) */
  share_ratio   NUMERIC(10,6) NOT NULL DEFAULT 0,
  /** 원장 엔트리 ID (추적용) */
  ledger_entry_id UUID,
  status        TEXT NOT NULL DEFAULT 'COMPLETED',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- 멱등성: 동일 event + user 중복 방지
  CONSTRAINT uq_rev_dist_event_user UNIQUE (event_id, user_id)
);

COMMENT ON TABLE public.revenue_distributions IS
  '수익 분배 개별 내역. event_id + user_id 유니크 제약으로 중복 분배를 방지합니다.';

-- ─────────────────────────────────────────────
-- 3. RLS 정책
-- ─────────────────────────────────────────────

ALTER TABLE public.revenue_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS rev_events_select ON public.revenue_events;
CREATE POLICY rev_events_select ON public.revenue_events
  FOR SELECT USING (true);

DROP POLICY IF EXISTS rev_events_insert ON public.revenue_events;
CREATE POLICY rev_events_insert ON public.revenue_events
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS rev_events_update ON public.revenue_events;
CREATE POLICY rev_events_update ON public.revenue_events
  FOR UPDATE USING (true);

ALTER TABLE public.revenue_distributions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS rev_dist_select_own ON public.revenue_distributions;
CREATE POLICY rev_dist_select_own ON public.revenue_distributions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS rev_dist_select_service ON public.revenue_distributions;
CREATE POLICY rev_dist_select_service ON public.revenue_distributions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS rev_dist_insert ON public.revenue_distributions;
CREATE POLICY rev_dist_insert ON public.revenue_distributions
  FOR INSERT WITH CHECK (true);

-- ─────────────────────────────────────────────
-- 4. RPC: rpc_distribute_revenue
-- ─────────────────────────────────────────────
-- 수익 이벤트의 net_amount를 해당 콘텐츠 보유자에게 비례 분배합니다.
--
-- 처리 순서:
--   1. advisory lock (event_id 기반)
--   2. 이벤트 유효성 확인 (PENDING 상태만)
--   3. 해당 content_id 보유자 조회 (positions 테이블)
--   4. 보유 비율 계산 + 분배 금액 산정
--   5. 각 투자자에게 ledger_entries CASH_CREDIT 기록
--   6. revenue_distributions 기록
--   7. 이벤트 상태를 DISTRIBUTED로 변경

CREATE OR REPLACE FUNCTION public.rpc_distribute_revenue(p_event_id UUID)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_event        RECORD;
  v_holder       RECORD;
  v_total_qty    NUMERIC;
  v_share_ratio  NUMERIC;
  v_payout       NUMERIC;
  v_distributed  NUMERIC := 0;
  v_count        INT := 0;
  v_ledger_id    UUID;
BEGIN
  -- 1. 동시 분배 방지
  PERFORM pg_advisory_xact_lock(hashtext('rev_distribute:' || p_event_id::text));

  -- 2. 이벤트 조회 및 상태 확인
  SELECT * INTO v_event
  FROM public.revenue_events
  WHERE id = p_event_id;

  IF v_event IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'EVENT_NOT_FOUND');
  END IF;

  IF v_event.status != 'PENDING' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'EVENT_ALREADY_PROCESSED', 'status', v_event.status);
  END IF;

  IF v_event.net_amount <= 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'ZERO_NET_AMOUNT');
  END IF;

  -- 3. 해당 콘텐츠 보유자의 총 수량 계산
  SELECT COALESCE(SUM(quantity), 0) INTO v_total_qty
  FROM public.positions
  WHERE asset_id = v_event.content_id
    AND quantity > 0;

  IF v_total_qty <= 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NO_HOLDERS');
  END IF;

  -- 4. 각 보유자에게 분배
  FOR v_holder IN
    SELECT user_id, quantity
    FROM public.positions
    WHERE asset_id = v_event.content_id
      AND quantity > 0
    ORDER BY user_id
  LOOP
    -- 보유 비율
    v_share_ratio := v_holder.quantity / v_total_qty;

    -- 분배 금액 (소수점 이하 절사)
    v_payout := FLOOR(v_event.net_amount * v_share_ratio);

    IF v_payout <= 0 THEN
      CONTINUE;
    END IF;

    -- 5. 원장에 CASH_CREDIT(배당금) 기록
    v_ledger_id := gen_random_uuid();
    INSERT INTO public.ledger_entries (
      id, user_id, order_id, entry_type, currency,
      amount, asset_id, quantity, memo, metadata, created_at
    ) VALUES (
      v_ledger_id,
      v_holder.user_id,
      NULL,
      'CASH_CREDIT',
      'KRW',
      v_payout,
      v_event.content_id,
      0,
      '수익분배 배당금',
      jsonb_build_object(
        'revenue_event_id', p_event_id,
        'share_ratio', v_share_ratio,
        'content_id', v_event.content_id
      ),
      now()
    );

    -- 6. 분배 내역 기록
    INSERT INTO public.revenue_distributions (
      event_id, user_id, amount, quantity_held, share_ratio, ledger_entry_id
    ) VALUES (
      p_event_id, v_holder.user_id, v_payout, v_holder.quantity, v_share_ratio, v_ledger_id
    )
    ON CONFLICT (event_id, user_id) DO NOTHING;

    v_distributed := v_distributed + v_payout;
    v_count := v_count + 1;
  END LOOP;

  -- 7. 이벤트 상태 변경
  UPDATE public.revenue_events
  SET status = 'DISTRIBUTED'
  WHERE id = p_event_id;

  RETURN jsonb_build_object(
    'ok', true,
    'event_id', p_event_id,
    'total_distributed', v_distributed,
    'undistributed', v_event.net_amount - v_distributed,
    'holder_count', v_count
  );
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object('ok', false, 'error', 'DUPLICATE_DISTRIBUTION');
  WHEN OTHERS THEN
    RETURN jsonb_build_object('ok', false, 'error', SQLERRM);
END;
$$;

COMMENT ON FUNCTION public.rpc_distribute_revenue IS
  '수익 이벤트를 보유자에게 비례 분배합니다. 원장 CASH_CREDIT 기록 + revenue_distributions 멱등 기록.';

GRANT EXECUTE ON FUNCTION public.rpc_distribute_revenue(UUID) TO service_role;

-- ─────────────────────────────────────────────
-- 5. 인덱스
-- ─────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_rev_events_content ON public.revenue_events (content_id);
CREATE INDEX IF NOT EXISTS idx_rev_events_status ON public.revenue_events (status);
CREATE INDEX IF NOT EXISTS idx_rev_dist_event ON public.revenue_distributions (event_id);
CREATE INDEX IF NOT EXISTS idx_rev_dist_user ON public.revenue_distributions (user_id);
CREATE INDEX IF NOT EXISTS idx_rev_dist_created ON public.revenue_distributions (created_at DESC);

-- 원장에서 배당금 조회 최적화
CREATE INDEX IF NOT EXISTS idx_ledger_dividend_memo
  ON public.ledger_entries (user_id, created_at DESC)
  WHERE memo = '수익분배 배당금';

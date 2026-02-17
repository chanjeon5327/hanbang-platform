-- ============================================================================
-- HANBANG Exchange V2 — 배당주 (Corporate Actions: Dividend Pipeline)
-- ============================================================================
--
-- [금융감독원 전자금융업 감독규정 준수]
-- 1. 기업행위(배당) 일정의 명시적 관리 (ex_date, record_date, pay_date)
-- 2. record_date 기준 보유자 스냅샷 → 정확한 배당 대상 확정
-- 3. 원장(ledger_entries) 기반 배당금 지급으로 감사 추적 완전성
-- 4. 상태 머신: SCHEDULED → SNAPSHOTTED → PAID → (CANCELED)
-- 5. 멱등성: action_id + user_id 유니크 제약
--
-- ============================================================================

-- ─────────────────────────────────────────────
-- 1. corporate_actions 테이블
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.corporate_actions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id          UUID NOT NULL,
  action_type       TEXT NOT NULL CHECK (action_type IN ('DIVIDEND')),
  ex_date           DATE NOT NULL,
  record_date       DATE NOT NULL,
  pay_date          DATE NOT NULL,
  amount_per_share  NUMERIC(18,6) NOT NULL,
  currency          TEXT NOT NULL DEFAULT 'KRW',
  status            TEXT NOT NULL DEFAULT 'SCHEDULED'
                    CHECK (status IN ('SCHEDULED','SNAPSHOTTED','PAID','CANCELED')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by        UUID,

  CONSTRAINT chk_ca_dates CHECK (ex_date <= record_date AND record_date <= pay_date)
);

COMMENT ON TABLE public.corporate_actions IS
  '기업행위(배당 등) 일정 관리 테이블. SCHEDULED → SNAPSHOTTED → PAID 상태 머신.';

-- ─────────────────────────────────────────────
-- 2. dividend_holders_snapshot 테이블
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.dividend_holders_snapshot (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id   UUID NOT NULL REFERENCES public.corporate_actions(id),
  user_id     UUID NOT NULL,
  quantity    NUMERIC(18,6) NOT NULL,
  payout      NUMERIC(18,2) NOT NULL DEFAULT 0,
  paid        BOOLEAN NOT NULL DEFAULT false,
  snapped_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_dhs_action_user UNIQUE (action_id, user_id)
);

-- ─────────────────────────────────────────────
-- 3. RLS
-- ─────────────────────────────────────────────

ALTER TABLE public.corporate_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY ca_select_public ON public.corporate_actions FOR SELECT USING (true);
CREATE POLICY ca_insert_service ON public.corporate_actions FOR INSERT WITH CHECK (true);
CREATE POLICY ca_update_service ON public.corporate_actions FOR UPDATE USING (true);

ALTER TABLE public.dividend_holders_snapshot ENABLE ROW LEVEL SECURITY;
CREATE POLICY dhs_select_own ON public.dividend_holders_snapshot FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY dhs_select_service ON public.dividend_holders_snapshot FOR SELECT USING (true);
CREATE POLICY dhs_insert_service ON public.dividend_holders_snapshot FOR INSERT WITH CHECK (true);
CREATE POLICY dhs_update_service ON public.dividend_holders_snapshot FOR UPDATE USING (true);

-- ─────────────────────────────────────────────
-- 4. RPC: rpc_snapshot_dividend_holders
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.rpc_snapshot_dividend_holders(p_action_id UUID)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_action RECORD;
  v_count  INT := 0;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('div_snap:' || p_action_id::text));

  SELECT * INTO v_action FROM public.corporate_actions WHERE id = p_action_id;
  IF v_action IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'ACTION_NOT_FOUND');
  END IF;
  IF v_action.status != 'SCHEDULED' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INVALID_STATUS', 'current', v_action.status);
  END IF;

  INSERT INTO public.dividend_holders_snapshot (action_id, user_id, quantity, payout)
  SELECT
    p_action_id,
    p.user_id,
    p.quantity,
    FLOOR(p.quantity * v_action.amount_per_share)
  FROM public.positions p
  WHERE p.asset_id = v_action.asset_id AND p.quantity > 0
  ON CONFLICT (action_id, user_id) DO NOTHING;

  GET DIAGNOSTICS v_count = ROW_COUNT;

  UPDATE public.corporate_actions SET status = 'SNAPSHOTTED' WHERE id = p_action_id;

  RETURN jsonb_build_object('ok', true, 'holders', v_count);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_snapshot_dividend_holders(UUID) TO service_role;

-- ─────────────────────────────────────────────
-- 5. RPC: rpc_pay_dividend
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.rpc_pay_dividend(p_action_id UUID)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_action    RECORD;
  v_holder    RECORD;
  v_count     INT := 0;
  v_total     NUMERIC := 0;
  v_lid       UUID;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('div_pay:' || p_action_id::text));

  SELECT * INTO v_action FROM public.corporate_actions WHERE id = p_action_id;
  IF v_action IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'ACTION_NOT_FOUND');
  END IF;
  IF v_action.status != 'SNAPSHOTTED' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INVALID_STATUS', 'current', v_action.status);
  END IF;

  FOR v_holder IN
    SELECT * FROM public.dividend_holders_snapshot
    WHERE action_id = p_action_id AND NOT paid AND payout > 0
    ORDER BY user_id
  LOOP
    v_lid := gen_random_uuid();
    INSERT INTO public.ledger_entries (
      id, user_id, entry_type, currency, amount, asset_id, quantity, memo, metadata, created_at
    ) VALUES (
      v_lid, v_holder.user_id, 'DIVIDEND_CREDIT', 'KRW',
      v_holder.payout, v_action.asset_id, 0,
      '배당금 지급',
      jsonb_build_object('action_id', p_action_id, 'amount_per_share', v_action.amount_per_share),
      now()
    );

    UPDATE public.dividend_holders_snapshot SET paid = true WHERE id = v_holder.id;

    v_count := v_count + 1;
    v_total := v_total + v_holder.payout;
  END LOOP;

  UPDATE public.corporate_actions SET status = 'PAID' WHERE id = p_action_id;

  RETURN jsonb_build_object('ok', true, 'paid_count', v_count, 'total_paid', v_total);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_pay_dividend(UUID) TO service_role;

-- ─────────────────────────────────────────────
-- 6. 인덱스
-- ─────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_ca_asset ON public.corporate_actions (asset_id);
CREATE INDEX IF NOT EXISTS idx_ca_status ON public.corporate_actions (status);
CREATE INDEX IF NOT EXISTS idx_dhs_action ON public.dividend_holders_snapshot (action_id);
CREATE INDEX IF NOT EXISTS idx_dhs_user ON public.dividend_holders_snapshot (user_id);

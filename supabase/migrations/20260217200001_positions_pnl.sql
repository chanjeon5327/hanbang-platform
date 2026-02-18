-- ============================================================================
-- HANBANG Financial Engine V1 — 포지션(Position) 및 손익(PnL) 관리 시스템
-- ============================================================================
--
-- [금융감독원 전자금융업 감독규정 준수 사항]
-- 1. 투자자별 보유 자산의 정확한 수량·원가 관리
-- 2. 평균단가(이동평균법) 기반 취득원가 산정
-- 3. 원장(ledger_entries) INSERT 시 자동 포지션 갱신 (트리거 기반)
-- 4. 실현 손익: 매도 시 (매도가 - 평균단가) × 매도수량 으로 산정
-- 5. 미실현 손익: 실시간 시세 기반으로 API 레벨에서 산정
--
-- 포지션 관리 방식:
--   매수(ASSET_CREDIT): 가중평균 방식으로 avg_price 재계산
--     new_avg = (기존수량 × 기존평균 + 신규수량 × 신규단가) / (기존수량 + 신규수량)
--   매도(ASSET_DEBIT): avg_price 유지, 수량 차감, realized_pnl 누적
--
-- ============================================================================

-- ─────────────────────────────────────────────
-- 1. 포지션 테이블 생성
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.positions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL,
  asset_id     UUID NOT NULL,
  /** 보유 수량 (매수 - 매도 누계) */
  quantity     NUMERIC(18,6) NOT NULL DEFAULT 0,
  /** 평균 매수 단가 (KRW, 이동평균법) */
  avg_price    NUMERIC(18,2) NOT NULL DEFAULT 0,
  /** 총 취득 원가 (KRW) */
  total_cost   NUMERIC(18,2) NOT NULL DEFAULT 0,
  /** 누적 실현 손익 (KRW) */
  realized_pnl NUMERIC(18,2) NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_positions_user_asset UNIQUE (user_id, asset_id),
  CONSTRAINT chk_positions_quantity CHECK (quantity >= 0)
);

COMMENT ON TABLE public.positions IS
  '투자자별 자산 포지션 테이블. 원장(ledger_entries) INSERT 트리거로 자동 갱신되며, 이동평균법 기반 평균단가와 실현손익을 관리합니다.';

-- ─────────────────────────────────────────────
-- 2. RLS 정책: 사용자는 자신의 포지션만 조회 가능
-- ─────────────────────────────────────────────

ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS positions_select_own ON public.positions;
CREATE POLICY positions_select_own ON public.positions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS positions_insert_service ON public.positions;
CREATE POLICY positions_insert_service ON public.positions
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS positions_update_service ON public.positions;
CREATE POLICY positions_update_service ON public.positions
  FOR UPDATE USING (true);

-- ─────────────────────────────────────────────
-- 3. 포지션 자동 갱신 트리거 함수
-- ─────────────────────────────────────────────
-- 원장에 ASSET_CREDIT 또는 ASSET_DEBIT이 INSERT될 때
-- positions 테이블을 자동으로 갱신합니다.

CREATE OR REPLACE FUNCTION public.fn_update_position_on_ledger()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_cost_per_unit  NUMERIC(18,2);
  v_total_cost     NUMERIC(18,2);
  v_sale_proceeds  NUMERIC(18,2);
  v_sell_price     NUMERIC(18,2);
  v_existing       RECORD;
  v_pnl            NUMERIC(18,2);
BEGIN
  -- ASSET_CREDIT: 자산 취득 (매수)
  IF NEW.entry_type IN ('ASSET_CREDIT', 'TRADE_BUY', 'PRODUCT_PURCHASE')
     AND NEW.asset_id IS NOT NULL
     AND NEW.quantity > 0
  THEN
    -- 동일 주문의 CASH_DEBIT에서 매수 원가 추출
    SELECT COALESCE(ABS(SUM(amount)), 0) INTO v_total_cost
    FROM public.ledger_entries
    WHERE order_id = NEW.order_id
      AND entry_type = 'CASH_DEBIT'
      AND order_id IS NOT NULL;

    -- CASH_DEBIT이 아직 없는 경우 (순서 역전 또는 무상 취득)
    IF v_total_cost = 0 OR v_total_cost IS NULL THEN
      v_total_cost := 0;
    END IF;

    v_cost_per_unit := CASE
      WHEN NEW.quantity > 0 THEN v_total_cost / NEW.quantity
      ELSE 0
    END;

    -- UPSERT: 신규 포지션 생성 또는 기존 포지션 가중평균 갱신
    INSERT INTO public.positions (user_id, asset_id, quantity, avg_price, total_cost, realized_pnl)
    VALUES (NEW.user_id, NEW.asset_id, NEW.quantity, v_cost_per_unit, v_total_cost, 0)
    ON CONFLICT (user_id, asset_id)
    DO UPDATE SET
      -- 가중평균 단가: (기존수량×기존평균 + 신규수량×신규단가) / (기존수량 + 신규수량)
      avg_price = CASE
        WHEN (positions.quantity + EXCLUDED.quantity) > 0
        THEN (positions.quantity * positions.avg_price + EXCLUDED.quantity * v_cost_per_unit)
             / (positions.quantity + EXCLUDED.quantity)
        ELSE positions.avg_price
      END,
      total_cost = positions.total_cost + v_total_cost,
      quantity   = positions.quantity + EXCLUDED.quantity,
      updated_at = now();
  END IF;

  -- ASSET_DEBIT: 자산 처분 (매도)
  IF NEW.entry_type IN ('ASSET_DEBIT', 'TRADE_SELL', 'PRODUCT_SELL')
     AND NEW.asset_id IS NOT NULL
     AND NEW.quantity > 0
  THEN
    -- 기존 포지션 조회
    SELECT quantity, avg_price, realized_pnl
    INTO v_existing
    FROM public.positions
    WHERE user_id = NEW.user_id AND asset_id = NEW.asset_id;

    IF v_existing IS NOT NULL AND v_existing.quantity > 0 THEN
      -- 동일 주문의 CASH_CREDIT에서 매도 대금 추출
      SELECT COALESCE(SUM(amount), 0) INTO v_sale_proceeds
      FROM public.ledger_entries
      WHERE order_id = NEW.order_id
        AND entry_type = 'CASH_CREDIT'
        AND order_id IS NOT NULL;

      v_sell_price := CASE
        WHEN NEW.quantity > 0 THEN v_sale_proceeds / NEW.quantity
        ELSE 0
      END;

      -- 실현 손익 = (매도 단가 - 평균 매수 단가) × 매도 수량
      v_pnl := (v_sell_price - v_existing.avg_price) * LEAST(NEW.quantity, v_existing.quantity);

      UPDATE public.positions
      SET quantity     = GREATEST(0, quantity - NEW.quantity),
          realized_pnl = realized_pnl + COALESCE(v_pnl, 0),
          total_cost   = GREATEST(0, total_cost - v_existing.avg_price * LEAST(NEW.quantity, v_existing.quantity)),
          updated_at   = now()
      WHERE user_id = NEW.user_id AND asset_id = NEW.asset_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- AFTER INSERT 트리거: 원장 INSERT 완료 후 포지션 갱신
DROP TRIGGER IF EXISTS trg_ledger_update_position ON public.ledger_entries;
CREATE TRIGGER trg_ledger_update_position
  AFTER INSERT ON public.ledger_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_update_position_on_ledger();

COMMENT ON TRIGGER trg_ledger_update_position ON public.ledger_entries IS
  '원장 INSERT 후 포지션 테이블을 자동 갱신합니다. ASSET_CREDIT 시 가중평균 매수가 계산, ASSET_DEBIT 시 실현손익 산정.';

-- ─────────────────────────────────────────────
-- 4. 기존 원장 데이터로 포지션 초기 구축
-- ─────────────────────────────────────────────
-- 마이그레이션 시점의 기존 원장 데이터를 기반으로
-- positions 테이블을 초기 구축합니다.

INSERT INTO public.positions (user_id, asset_id, quantity, avg_price, total_cost, realized_pnl)
SELECT
  le.user_id,
  le.asset_id,
  -- 보유 수량: CREDIT - DEBIT
  GREATEST(0, SUM(
    CASE
      WHEN le.entry_type IN ('ASSET_CREDIT', 'TRADE_BUY', 'PRODUCT_PURCHASE') THEN le.quantity
      WHEN le.entry_type IN ('ASSET_DEBIT', 'TRADE_SELL', 'PRODUCT_SELL')   THEN -le.quantity
      ELSE 0
    END
  )),
  -- 평균 매수가: 총 매수 원가 / 총 매수 수량 (근사치)
  CASE
    WHEN SUM(CASE WHEN le.entry_type IN ('ASSET_CREDIT', 'TRADE_BUY', 'PRODUCT_PURCHASE') THEN le.quantity ELSE 0 END) > 0
    THEN COALESCE(
      (SELECT SUM(ABS(cd.amount))
       FROM public.ledger_entries cd
       WHERE cd.user_id = le.user_id
         AND cd.entry_type = 'CASH_DEBIT'
         AND cd.order_id IN (
           SELECT DISTINCT ac.order_id FROM public.ledger_entries ac
           WHERE ac.user_id = le.user_id
             AND ac.asset_id = le.asset_id
             AND ac.entry_type IN ('ASSET_CREDIT', 'TRADE_BUY', 'PRODUCT_PURCHASE')
             AND ac.order_id IS NOT NULL
         )
      ), 0)
      / NULLIF(SUM(CASE WHEN le.entry_type IN ('ASSET_CREDIT', 'TRADE_BUY', 'PRODUCT_PURCHASE') THEN le.quantity ELSE 0 END), 0)
    ELSE 0
  END,
  -- 총 취득 원가
  COALESCE(
    (SELECT SUM(ABS(cd2.amount))
     FROM public.ledger_entries cd2
     WHERE cd2.user_id = le.user_id
       AND cd2.entry_type = 'CASH_DEBIT'
       AND cd2.order_id IN (
         SELECT DISTINCT ac2.order_id FROM public.ledger_entries ac2
         WHERE ac2.user_id = le.user_id
           AND ac2.asset_id = le.asset_id
           AND ac2.entry_type IN ('ASSET_CREDIT', 'TRADE_BUY', 'PRODUCT_PURCHASE')
           AND ac2.order_id IS NOT NULL
       )
    ), 0),
  -- 실현 손익: 초기값 0 (향후 매도 시 누적)
  0
FROM public.ledger_entries le
WHERE le.asset_id IS NOT NULL
GROUP BY le.user_id, le.asset_id
HAVING SUM(
  CASE
    WHEN le.entry_type IN ('ASSET_CREDIT', 'TRADE_BUY', 'PRODUCT_PURCHASE') THEN le.quantity
    WHEN le.entry_type IN ('ASSET_DEBIT', 'TRADE_SELL', 'PRODUCT_SELL')   THEN -le.quantity
    ELSE 0
  END
) > 0
ON CONFLICT (user_id, asset_id) DO NOTHING;

-- ─────────────────────────────────────────────
-- 5. 인덱스
-- ─────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_positions_user ON public.positions (user_id);
CREATE INDEX IF NOT EXISTS idx_positions_asset ON public.positions (asset_id);

-- ============================================================================
-- HANBANG Financial Engine V1 — 정산 스냅샷 동결(Settlement Freeze) 시스템
-- ============================================================================
--
-- [금융감독원 전자금융업 감독규정 준수 사항]
-- 1. 정산 확정(finalize) 시 해당 시점의 원장 상태를 해시로 봉인
-- 2. 봉인된 정산 배치의 원장 스냅샷 해시로 사후 검증 가능
-- 3. 정산 확정 후 해당 기간의 원장 변경 불가 (Append-Only 구조로 자동 보장)
-- 4. 정산 확정 관리자 ID 및 시각 기록 (감사 추적)
--
-- 동결 해시 생성 방식:
--   각 사용자의 마지막 row_hash를 수집 → 정렬 → 연결 → SHA-256
--   이를 통해 정산 시점의 전체 원장 상태를 단일 해시로 표현
--
-- ============================================================================

-- pgcrypto 필수 (이전 마이그레이션에서 이미 활성화)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─────────────────────────────────────────────
-- 1. settlement_batches 테이블 확장
-- ─────────────────────────────────────────────
-- 기존 테이블에 동결 관련 컬럼 추가

-- 테이블이 존재하지 않는 경우 생성
CREATE TABLE IF NOT EXISTS public.settlement_batches (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  settlement_date DATE NOT NULL,
  confirmed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 동결 관련 컬럼 추가
ALTER TABLE public.settlement_batches
  ADD COLUMN IF NOT EXISTS ledger_snapshot_hash TEXT,
  ADD COLUMN IF NOT EXISTS entry_count_at_seal  INT,
  ADD COLUMN IF NOT EXISTS finalized_at         TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS finalized_by         UUID;

COMMENT ON COLUMN public.settlement_batches.ledger_snapshot_hash IS
  '정산 확정 시점의 원장 상태 해시. 모든 사용자의 마지막 row_hash를 결합한 SHA-256 해시.';
COMMENT ON COLUMN public.settlement_batches.entry_count_at_seal IS
  '정산 확정 시점의 원장 엔트리 총 수. 사후 검증에 사용.';
COMMENT ON COLUMN public.settlement_batches.finalized_at IS
  '정산이 최종 확정된 시각.';
COMMENT ON COLUMN public.settlement_batches.finalized_by IS
  '정산을 확정한 관리자 UUID.';

-- ─────────────────────────────────────────────
-- 2. RLS 정책
-- ─────────────────────────────────────────────

ALTER TABLE public.settlement_batches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS settlement_select_auth ON public.settlement_batches;
CREATE POLICY settlement_select_auth ON public.settlement_batches
  FOR SELECT USING (true);

DROP POLICY IF EXISTS settlement_insert_service ON public.settlement_batches;
CREATE POLICY settlement_insert_service ON public.settlement_batches
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS settlement_update_service ON public.settlement_batches;
CREATE POLICY settlement_update_service ON public.settlement_batches
  FOR UPDATE USING (true);

-- ─────────────────────────────────────────────
-- 3. 정산 동결 RPC: rpc_finalize_settlement
-- ─────────────────────────────────────────────
-- 정산 배치를 최종 확정하고 원장 스냅샷 해시를 봉인합니다.
--
-- 처리 절차:
--   1. advisory lock으로 동시 정산 확정 방지
--   2. 배치 존재 및 상태 확인
--   3. 전체 원장의 사용자별 마지막 row_hash 수집
--   4. row_hash들을 정렬·연결하여 스냅샷 해시 생성
--   5. settlement_batches 레코드 갱신
--   6. 정산 대상 주문의 settled_at 기록

CREATE OR REPLACE FUNCTION public.rpc_finalize_settlement(
  p_batch_id    UUID,
  p_admin_id    UUID
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_batch         RECORD;
  v_snapshot_hash TEXT;
  v_entry_count   INT;
  v_user_hashes   TEXT[];
BEGIN
  -- 1. 동시 정산 확정 방지 (배치 ID 기반 advisory lock)
  PERFORM pg_advisory_xact_lock(hashtext('settlement_finalize:' || p_batch_id::text));

  -- 2. 배치 존재 확인
  SELECT * INTO v_batch
  FROM public.settlement_batches
  WHERE id = p_batch_id;

  IF v_batch IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'BATCH_NOT_FOUND');
  END IF;

  -- 이미 확정된 배치인지 확인
  IF v_batch.finalized_at IS NOT NULL THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'ALREADY_FINALIZED',
      'finalized_at', v_batch.finalized_at::text
    );
  END IF;

  -- 3. 현재 원장 엔트리 총 수
  SELECT COUNT(*) INTO v_entry_count FROM public.ledger_entries;

  -- 4. 사용자별 마지막 row_hash 수집 → 정렬 → 연결
  SELECT ARRAY_AGG(last_hash ORDER BY user_id) INTO v_user_hashes
  FROM (
    SELECT DISTINCT ON (user_id)
      user_id,
      COALESCE(row_hash, 'UNKNOWN') AS last_hash
    FROM public.ledger_entries
    WHERE row_hash IS NOT NULL
    ORDER BY user_id, seq DESC NULLS LAST, created_at DESC, id DESC
  ) sub;

  -- 5. 스냅샷 해시 생성: 모든 사용자의 마지막 row_hash를 연결 → SHA-256
  v_snapshot_hash := encode(
    digest(
      COALESCE(array_to_string(v_user_hashes, '|'), 'EMPTY_LEDGER'),
      'sha256'
    ),
    'hex'
  );

  -- 6. 정산 배치 갱신
  UPDATE public.settlement_batches
  SET ledger_snapshot_hash = v_snapshot_hash,
      entry_count_at_seal  = v_entry_count,
      finalized_at         = now(),
      finalized_by         = p_admin_id,
      confirmed_at         = COALESCE(confirmed_at, now())
  WHERE id = p_batch_id;

  -- 7. 정산 대상 주문에 settled_at 기록 (해당 배치에 연결된 주문)
  UPDATE public.orders
  SET settled_at = now()
  WHERE settlement_batch_id = p_batch_id
    AND settled_at IS NULL;

  RETURN jsonb_build_object(
    'ok', true,
    'batch_id', p_batch_id,
    'ledger_snapshot_hash', v_snapshot_hash,
    'entry_count', v_entry_count,
    'finalized_at', now()::text
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('ok', false, 'error', SQLERRM);
END;
$$;

COMMENT ON FUNCTION public.rpc_finalize_settlement IS
  '정산 배치를 최종 확정하고 원장 스냅샷 해시를 봉인합니다. 확정 후 해당 기간의 원장 정합성을 사후 검증할 수 있습니다.';

GRANT EXECUTE ON FUNCTION public.rpc_finalize_settlement(UUID, UUID) TO service_role;

-- ─────────────────────────────────────────────
-- 4. 인덱스
-- ─────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_settlement_date
  ON public.settlement_batches (settlement_date DESC);

CREATE INDEX IF NOT EXISTS idx_settlement_finalized
  ON public.settlement_batches (finalized_at) WHERE finalized_at IS NOT NULL;

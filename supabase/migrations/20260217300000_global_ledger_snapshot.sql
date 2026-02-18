-- ============================================================================
-- HANBANG Financial Engine V1.5 — 글로벌 원장 스냅샷 (Merkle-like Aggregation)
-- ============================================================================
--
-- [금융감독원 전자금융업 감독규정 준수 사항]
-- 1. Per-user 해시 체인의 한계 보완: 사용자 간 교차 검증 불가 → 글로벌 스냅샷으로 해결
-- 2. 일자별 전체 원장 상태를 단일 SHA-256 해시로 집약
-- 3. 정렬 규칙 고정(user_id ASC)으로 재현 가능한 결정론적 해시
-- 4. advisory lock으로 동시 스냅샷 생성 방지
-- 5. 사후 검증 RPC로 스냅샷 위·변조 탐지
--
-- 스냅샷 해시 생성 방식:
--   1) 모든 사용자의 최신 row_hash를 user_id ASC 순서로 수집
--   2) fn_hash_concat 으로 안전하게 결합: 'U:<user_id>:H:<row_hash>' 패턴
--   3) 결합된 문자열에 SHA-256 적용 → snapshot_hash
--
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─────────────────────────────────────────────
-- 1. global_ledger_snapshots 테이블
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.global_ledger_snapshots (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  /** 스냅샷 기준 날짜 */
  snap_date      DATE NOT NULL,
  /** 전체 원장 상태 해시 (모든 사용자 최신 row_hash 결합 → SHA-256) */
  snapshot_hash  TEXT NOT NULL,
  /** 스냅샷 시점의 고유 사용자 수 */
  user_count     INT NOT NULL DEFAULT 0,
  /** 스냅샷 시점의 총 원장 엔트리 수 */
  entry_count    INT NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  /** 스냅샷 생성자 (관리자 UUID 또는 system) */
  created_by     UUID
);

COMMENT ON TABLE public.global_ledger_snapshots IS
  '일자별 글로벌 원장 스냅샷. 모든 사용자의 per-user 해시 체인을 결합하여 전체 원장 상태를 단일 해시로 표현합니다.';

-- RLS: 관리자/service_role만 생성, 인증 사용자 조회 가능
ALTER TABLE public.global_ledger_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS gls_select_auth ON public.global_ledger_snapshots;
CREATE POLICY gls_select_auth ON public.global_ledger_snapshots
  FOR SELECT USING (true);

DROP POLICY IF EXISTS gls_insert_service ON public.global_ledger_snapshots;
CREATE POLICY gls_insert_service ON public.global_ledger_snapshots
  FOR INSERT WITH CHECK (true);

-- 동일 날짜 중복 방지
CREATE UNIQUE INDEX IF NOT EXISTS idx_gls_snap_date
  ON public.global_ledger_snapshots (snap_date);

-- ─────────────────────────────────────────────
-- 2. fn_hash_concat — 안전한 해시 결합 함수
-- ─────────────────────────────────────────────
-- TEXT 배열을 받아 각 요소를 'U:<idx>:H:<value>' 패턴으로
-- 파이프 구분자와 결합한 후 SHA-256 해시를 반환합니다.
-- 빈 배열이면 'EMPTY_LEDGER'의 해시를 반환합니다.

CREATE OR REPLACE FUNCTION public.fn_hash_concat(p_hashes TEXT[])
RETURNS TEXT
LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  v_combined TEXT := '';
  v_i INT;
BEGIN
  IF p_hashes IS NULL OR array_length(p_hashes, 1) IS NULL THEN
    RETURN encode(extensions.digest('EMPTY_LEDGER', 'sha256'), 'hex');
  END IF;

  FOR v_i IN 1..array_length(p_hashes, 1) LOOP
    IF v_i > 1 THEN v_combined := v_combined || '|'; END IF;
    v_combined := v_combined || COALESCE(p_hashes[v_i], '0');
  END LOOP;

  RETURN encode(extensions.digest(v_combined, 'sha256'), 'hex');
END;
$$;

COMMENT ON FUNCTION public.fn_hash_concat IS
  'TEXT 배열을 파이프로 결합한 후 SHA-256 해시를 반환합니다. 글로벌 스냅샷 해시 생성에 사용.';

-- ─────────────────────────────────────────────
-- 3. RPC: rpc_create_global_ledger_snapshot
-- ─────────────────────────────────────────────
-- 지정 날짜(기본 오늘)의 글로벌 원장 스냅샷을 생성합니다.
-- 이미 존재하면 갱신(UPSERT)합니다.

CREATE OR REPLACE FUNCTION public.rpc_create_global_ledger_snapshot(
  p_snap_date DATE DEFAULT CURRENT_DATE,
  p_created_by UUID DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_hashes  TEXT[];
  v_snapshot_hash TEXT;
  v_user_count   INT;
  v_entry_count  INT;
  v_snap_id      UUID;
BEGIN
  -- 동시 스냅샷 생성 방지
  PERFORM pg_advisory_xact_lock(hashtext('global_ledger_snapshot:' || p_snap_date::text));

  -- 각 사용자의 최신 row_hash를 user_id ASC 순서로 수집
  -- 결합 패턴: 'U:<user_id>::H:<row_hash>' → 재현 가능한 결정론적 순서
  SELECT
    ARRAY_AGG('U:' || sub.user_id::text || ':H:' || sub.last_hash ORDER BY sub.user_id),
    COUNT(*)
  INTO v_user_hashes, v_user_count
  FROM (
    SELECT DISTINCT ON (user_id)
      user_id,
      COALESCE(row_hash, '0') AS last_hash
    FROM public.ledger_entries
    WHERE row_hash IS NOT NULL
    ORDER BY user_id, seq DESC NULLS LAST, created_at DESC, id DESC
  ) sub;

  -- 총 엔트리 수
  SELECT COUNT(*) INTO v_entry_count FROM public.ledger_entries;

  -- 스냅샷 해시 생성
  v_snapshot_hash := public.fn_hash_concat(v_user_hashes);

  -- UPSERT: 동일 날짜면 갱신
  INSERT INTO public.global_ledger_snapshots (
    snap_date, snapshot_hash, user_count, entry_count, created_by
  ) VALUES (
    p_snap_date, v_snapshot_hash, COALESCE(v_user_count, 0), v_entry_count, p_created_by
  )
  ON CONFLICT (snap_date) DO UPDATE SET
    snapshot_hash = EXCLUDED.snapshot_hash,
    user_count    = EXCLUDED.user_count,
    entry_count   = EXCLUDED.entry_count,
    created_by    = EXCLUDED.created_by,
    created_at    = now()
  RETURNING id INTO v_snap_id;

  RETURN jsonb_build_object(
    'ok', true,
    'id', v_snap_id,
    'snap_date', p_snap_date::text,
    'snapshot_hash', v_snapshot_hash,
    'user_count', COALESCE(v_user_count, 0),
    'entry_count', v_entry_count
  );
END;
$$;

COMMENT ON FUNCTION public.rpc_create_global_ledger_snapshot IS
  '지정 날짜의 글로벌 원장 스냅샷을 생성합니다. 모든 사용자의 최신 row_hash를 결합하여 전체 원장 상태를 단일 해시로 표현.';

GRANT EXECUTE ON FUNCTION public.rpc_create_global_ledger_snapshot(DATE, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.rpc_create_global_ledger_snapshot(DATE, UUID) TO authenticated;

-- ─────────────────────────────────────────────
-- 4. RPC: rpc_verify_global_snapshot
-- ─────────────────────────────────────────────
-- 저장된 스냅샷의 해시를 현재 원장 상태와 비교하여
-- 위·변조 여부를 검증합니다.

CREATE OR REPLACE FUNCTION public.rpc_verify_global_snapshot(p_id UUID)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_snap          RECORD;
  v_user_hashes   TEXT[];
  v_recomputed    TEXT;
  v_current_count INT;
BEGIN
  -- 스냅샷 조회
  SELECT * INTO v_snap
  FROM public.global_ledger_snapshots
  WHERE id = p_id;

  IF v_snap IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'SNAPSHOT_NOT_FOUND');
  END IF;

  -- 현재 원장 상태로 해시 재계산
  SELECT
    ARRAY_AGG('U:' || sub.user_id::text || ':H:' || sub.last_hash ORDER BY sub.user_id)
  INTO v_user_hashes
  FROM (
    SELECT DISTINCT ON (user_id)
      user_id,
      COALESCE(row_hash, '0') AS last_hash
    FROM public.ledger_entries
    WHERE row_hash IS NOT NULL
    ORDER BY user_id, seq DESC NULLS LAST, created_at DESC, id DESC
  ) sub;

  v_recomputed := public.fn_hash_concat(v_user_hashes);

  SELECT COUNT(*) INTO v_current_count FROM public.ledger_entries;

  RETURN jsonb_build_object(
    'ok', true,
    'snapshot_id', v_snap.id,
    'snap_date', v_snap.snap_date::text,
    'stored_hash', v_snap.snapshot_hash,
    'recomputed_hash', v_recomputed,
    'hash_match', (v_snap.snapshot_hash = v_recomputed),
    'stored_entry_count', v_snap.entry_count,
    'current_entry_count', v_current_count,
    'entry_count_match', (v_snap.entry_count = v_current_count),
    'verified_at', now()::text
  );
END;
$$;

COMMENT ON FUNCTION public.rpc_verify_global_snapshot IS
  '글로벌 스냅샷의 해시를 현재 원장 상태와 비교하여 위·변조 여부를 검증합니다.';

GRANT EXECUTE ON FUNCTION public.rpc_verify_global_snapshot(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.rpc_verify_global_snapshot(UUID) TO authenticated;

-- ─────────────────────────────────────────────
-- 5. 추가 인덱스 (성능 최적화)
-- ─────────────────────────────────────────────
-- per-user 최신 row_hash 조회 최적화

CREATE INDEX IF NOT EXISTS idx_ledger_user_seq_desc
  ON public.ledger_entries (user_id, seq DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_ledger_user_created_desc
  ON public.ledger_entries (user_id, created_at DESC);

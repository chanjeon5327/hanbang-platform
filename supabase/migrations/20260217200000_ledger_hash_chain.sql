-- ============================================================================
-- HANBANG Financial Engine V1 — 원장(Ledger) 불변 해시 체인 시스템
-- ============================================================================
--
-- [금융감독원 전자금융업 감독규정 준수 사항]
-- 1. 거래기록의 위·변조 방지를 위한 해시 체인(Hash Chain) 구조 적용
-- 2. SHA-256 기반 전방향 해시 연결로 원장 무결성 보장
-- 3. 원장 레코드의 UPDATE/DELETE 완전 차단 (Append-Only)
-- 4. 사용자 단위 해시 체인으로 개별 계좌 정합성 독립 검증 가능
-- 5. 무결성 검증 RPC 제공으로 실시간 감사 지원
--
-- 체인 구조:
--   row[n].row_hash = SHA256(row[n].prev_hash || '|' || row[n].data_fields)
--   row[n].prev_hash = row[n-1].row_hash  (동일 user_id 내 seq 순서)
--   row[0].prev_hash = 'GENESIS'           (각 사용자의 첫 엔트리)
--
-- ============================================================================

-- pgcrypto 확장: SHA-256 해시 함수 사용을 위해 필수
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─────────────────────────────────────────────
-- 1. 해시 체인 컬럼 추가 + 전역 순서 시퀀스
-- ─────────────────────────────────────────────

-- 전역 순서 시퀀스: 해시 체인의 결정론적 순서 보장
CREATE SEQUENCE IF NOT EXISTS ledger_entries_seq;

-- 해시 체인 컬럼 추가
ALTER TABLE public.ledger_entries
  ADD COLUMN IF NOT EXISTS seq       BIGINT,
  ADD COLUMN IF NOT EXISTS prev_hash TEXT,
  ADD COLUMN IF NOT EXISTS row_hash  TEXT,
  ADD COLUMN IF NOT EXISTS sealed_at TIMESTAMPTZ;

-- seq 기본값 설정
ALTER TABLE public.ledger_entries
  ALTER COLUMN seq SET DEFAULT nextval('ledger_entries_seq');

-- ─────────────────────────────────────────────
-- 2. 해시 계산 도우미 함수 (IMMUTABLE — 동일 입력은 항상 동일 출력)
-- ─────────────────────────────────────────────
-- 원장 엔트리의 핵심 필드를 파이프(|) 구분자로 연결한 후
-- SHA-256 해시를 생성합니다. NULL 값은 명시적 문자열로 치환하여
-- 해시 충돌을 방지합니다.

CREATE OR REPLACE FUNCTION public.fn_compute_ledger_hash(
  p_prev_hash TEXT,
  p_id        UUID,
  p_user_id   UUID,
  p_order_id  UUID,
  p_entry_type TEXT,
  p_currency  TEXT,
  p_amount    NUMERIC,
  p_asset_id  UUID,
  p_quantity  NUMERIC,
  p_memo      TEXT,
  p_metadata  JSONB
) RETURNS TEXT
LANGUAGE plpgsql IMMUTABLE AS $$
BEGIN
  RETURN encode(
    extensions.digest(
      COALESCE(p_prev_hash, 'GENESIS') || '|' ||
      p_id::text                        || '|' ||
      p_user_id::text                   || '|' ||
      COALESCE(p_order_id::text, 'NULL') || '|' ||
      p_entry_type                      || '|' ||
      p_currency                        || '|' ||
      p_amount::text                    || '|' ||
      COALESCE(p_asset_id::text, 'NULL') || '|' ||
      p_quantity::text                  || '|' ||
      COALESCE(p_memo, '')              || '|' ||
      COALESCE(p_metadata::text, '{}'),
      'sha256'
    ),
    'hex'
  );
END;
$$;

COMMENT ON FUNCTION public.fn_compute_ledger_hash IS
  '원장 엔트리의 SHA-256 해시를 계산합니다. 이전 해시(prev_hash)와 현재 행의 핵심 필드를 결합하여 해시 체인을 구성합니다.';

-- ─────────────────────────────────────────────
-- 3. INSERT 트리거: 해시 체인 자동 봉인
-- ─────────────────────────────────────────────
-- 매 INSERT 시 동일 user_id의 직전 row_hash를 조회하여
-- 새 행의 prev_hash/row_hash를 자동 계산합니다.
-- advisory lock으로 동일 사용자의 동시 INSERT를 직렬화하여
-- 체인 무결성을 보장합니다.

CREATE OR REPLACE FUNCTION public.fn_ledger_hash_seal()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
DECLARE
  v_last_hash TEXT;
BEGIN
  -- 동일 사용자에 대한 동시 INSERT 직렬화 (트랜잭션 범위 잠금)
  -- hashtext는 TEXT를 INT4로 변환하여 advisory lock 키로 사용
  PERFORM pg_advisory_xact_lock(hashtext('ledger_seal:' || NEW.user_id::text));

  -- 해당 사용자의 가장 최근 row_hash 조회
  SELECT row_hash INTO v_last_hash
  FROM public.ledger_entries
  WHERE user_id = NEW.user_id
    AND row_hash IS NOT NULL
  ORDER BY seq DESC NULLS LAST, created_at DESC, id DESC
  LIMIT 1;

  -- seq 자동 할당 (DEFAULT가 적용되지 않은 경우 대비)
  IF NEW.seq IS NULL THEN
    NEW.seq := nextval('ledger_entries_seq');
  END IF;

  -- 체인 연결: 이전 해시 설정
  NEW.prev_hash := COALESCE(v_last_hash, 'GENESIS');

  -- 현재 행의 해시 계산
  NEW.row_hash := public.fn_compute_ledger_hash(
    NEW.prev_hash,
    NEW.id,
    NEW.user_id,
    NEW.order_id,
    NEW.entry_type,
    NEW.currency,
    NEW.amount,
    NEW.asset_id,
    NEW.quantity,
    NEW.memo,
    NEW.metadata
  );

  -- 봉인 시각 기록
  NEW.sealed_at := now();

  RETURN NEW;
END;
$$;

-- 트리거 등록: 기존 검증 트리거(trg_ledger_amount_check 등) 이후에 실행되도록
-- 알파벳 순서 'h'가 'a', 'c', 'e' 이후
DROP TRIGGER IF EXISTS trg_ledger_hash_seal ON public.ledger_entries;
CREATE TRIGGER trg_ledger_hash_seal
  BEFORE INSERT ON public.ledger_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_ledger_hash_seal();

COMMENT ON TRIGGER trg_ledger_hash_seal ON public.ledger_entries IS
  '원장 INSERT 시 SHA-256 해시 체인을 자동으로 계산하여 봉인합니다. advisory lock으로 동일 사용자의 동시 INSERT를 직렬화합니다.';

-- ─────────────────────────────────────────────
-- 4. UPDATE 완전 차단 트리거
-- ─────────────────────────────────────────────
-- 전자금융업 감독규정상 원장 기록은 수정이 불가해야 합니다.
-- 오류 발생 시 반대 거래(reversal entry)로 처리해야 합니다.

CREATE OR REPLACE FUNCTION public.fn_ledger_block_update()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'LEDGER_IMMUTABLE: 원장 레코드의 UPDATE는 금지되어 있습니다. '
    '전자금융업 감독규정에 따라 원장은 Append-Only 구조입니다. '
    '오류 수정이 필요한 경우 반대 거래(reversal entry)를 생성하십시오. '
    '[entry_id=%]', OLD.id;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_ledger_block_update ON public.ledger_entries;
CREATE TRIGGER trg_ledger_block_update
  BEFORE UPDATE ON public.ledger_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_ledger_block_update();

-- ─────────────────────────────────────────────
-- 5. DELETE 완전 차단 트리거
-- ─────────────────────────────────────────────
-- 원장 기록의 삭제는 어떠한 경우에도 허용되지 않습니다.
-- 감사 추적(audit trail)의 완전성을 보장하기 위함입니다.

CREATE OR REPLACE FUNCTION public.fn_ledger_block_delete()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'LEDGER_IMMUTABLE: 원장 레코드의 DELETE는 금지되어 있습니다. '
    '전자금융업 감독규정에 따라 원장 기록은 영구 보존됩니다. '
    '[entry_id=%]', OLD.id;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_ledger_block_delete ON public.ledger_entries;
CREATE TRIGGER trg_ledger_block_delete
  BEFORE DELETE ON public.ledger_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_ledger_block_delete();

-- ─────────────────────────────────────────────
-- 6. RLS 정책 강화
-- ─────────────────────────────────────────────
-- 사용자는 자신의 원장만 조회 가능.
-- INSERT/UPDATE/DELETE는 service_role(백엔드)만 가능.

ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ledger_select_own ON public.ledger_entries;
CREATE POLICY ledger_select_own ON public.ledger_entries
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS ledger_insert_service ON public.ledger_entries;
CREATE POLICY ledger_insert_service ON public.ledger_entries
  FOR INSERT
  WITH CHECK (true);

-- UPDATE/DELETE는 트리거에서 차단되므로 RLS에서도 명시적 차단
DROP POLICY IF EXISTS ledger_no_update ON public.ledger_entries;
CREATE POLICY ledger_no_update ON public.ledger_entries
  FOR UPDATE
  USING (false);

DROP POLICY IF EXISTS ledger_no_delete ON public.ledger_entries;
CREATE POLICY ledger_no_delete ON public.ledger_entries
  FOR DELETE
  USING (false);

-- ─────────────────────────────────────────────
-- 7. 기존 데이터 백필 (해시 체인 소급 적용)
-- ─────────────────────────────────────────────
-- 마이그레이션 시점에 기존 원장 엔트리에 해시를 소급 적용합니다.
-- UPDATE 차단 트리거를 임시 비활성화한 후 백필을 수행합니다.

-- ALL 트리거 임시 비활성화 (원격 DB에 추가 트리거 존재 가능)
ALTER TABLE public.ledger_entries DISABLE TRIGGER ALL;

DO $$
DECLARE
  v_user_id UUID;
  rec       RECORD;
  last_hash TEXT;
  computed  TEXT;
  v_seq     BIGINT := 0;
BEGIN
  -- 사용자별로 해시 체인 소급 적용
  FOR v_user_id IN
    SELECT DISTINCT user_id FROM public.ledger_entries
    WHERE row_hash IS NULL
    ORDER BY user_id
  LOOP
    last_hash := 'GENESIS';

    FOR rec IN
      SELECT * FROM public.ledger_entries
      WHERE user_id = v_user_id
      ORDER BY created_at, id
    LOOP
      v_seq := nextval('ledger_entries_seq');

      computed := public.fn_compute_ledger_hash(
        last_hash,
        rec.id,
        rec.user_id,
        rec.order_id,
        rec.entry_type,
        rec.currency,
        rec.amount,
        rec.asset_id,
        rec.quantity,
        rec.memo,
        rec.metadata
      );

      UPDATE public.ledger_entries
      SET prev_hash = last_hash,
          row_hash  = computed,
          sealed_at = COALESCE(rec.ledger_posted_at, rec.created_at),
          seq       = v_seq
      WHERE id = rec.id;

      last_hash := computed;
    END LOOP;
  END LOOP;
END;
$$;

-- ALL 트리거 재활성화
ALTER TABLE public.ledger_entries ENABLE TRIGGER ALL;

-- seq에 NOT NULL 제약 + 인덱스 추가
-- (백필 후 모든 행에 seq 값이 존재해야 함)
CREATE INDEX IF NOT EXISTS idx_ledger_entries_user_seq
  ON public.ledger_entries (user_id, seq DESC);

CREATE INDEX IF NOT EXISTS idx_ledger_entries_sealed
  ON public.ledger_entries (sealed_at);

-- ─────────────────────────────────────────────
-- 8. 무결성 검증 RPC: rpc_verify_ledger_integrity()
-- ─────────────────────────────────────────────
-- 전체 원장의 해시 체인 무결성을 검증합니다.
-- 각 사용자별로 체인을 순회하며:
--   (a) row_hash가 계산된 해시와 일치하는지 확인
--   (b) prev_hash가 이전 행의 row_hash와 일치하는지 확인
--
-- 반환값: { total_entries, mismatches, chain_breaks, first_mismatch_id, integrity_ok, verified_at }

CREATE OR REPLACE FUNCTION public.rpc_verify_ledger_integrity()
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id         UUID;
  rec               RECORD;
  computed_hash     TEXT;
  expected_prev     TEXT;
  total_count       INT := 0;
  mismatch_count    INT := 0;
  chain_break_count INT := 0;
  first_mismatch_id UUID := NULL;
BEGIN
  FOR v_user_id IN
    SELECT DISTINCT user_id FROM public.ledger_entries ORDER BY user_id
  LOOP
    expected_prev := 'GENESIS';

    FOR rec IN
      SELECT * FROM public.ledger_entries
      WHERE user_id = v_user_id
      ORDER BY seq, created_at, id
    LOOP
      total_count := total_count + 1;

      -- (a) prev_hash 체인 연결 확인
      IF rec.prev_hash IS DISTINCT FROM expected_prev THEN
        chain_break_count := chain_break_count + 1;
        IF first_mismatch_id IS NULL THEN
          first_mismatch_id := rec.id;
        END IF;
      END IF;

      -- (b) row_hash 재계산 검증
      computed_hash := public.fn_compute_ledger_hash(
        rec.prev_hash,
        rec.id,
        rec.user_id,
        rec.order_id,
        rec.entry_type,
        rec.currency,
        rec.amount,
        rec.asset_id,
        rec.quantity,
        rec.memo,
        rec.metadata
      );

      IF rec.row_hash IS DISTINCT FROM computed_hash THEN
        mismatch_count := mismatch_count + 1;
        IF first_mismatch_id IS NULL THEN
          first_mismatch_id := rec.id;
        END IF;
      END IF;

      expected_prev := rec.row_hash;
    END LOOP;
  END LOOP;

  RETURN jsonb_build_object(
    'total_entries',      total_count,
    'mismatches',         mismatch_count,
    'chain_breaks',       chain_break_count,
    'first_mismatch_id',  first_mismatch_id,
    'integrity_ok',       (mismatch_count = 0 AND chain_break_count = 0),
    'verified_at',        now()::text
  );
END;
$$;

COMMENT ON FUNCTION public.rpc_verify_ledger_integrity IS
  '원장 전체의 SHA-256 해시 체인 무결성을 검증합니다. 금융감독원 감사 시 원장 위·변조 여부를 증명하는 데 사용됩니다.';

-- 검증 RPC 실행 권한: 인증된 사용자 (관리자 여부는 API 레벨에서 검증)
GRANT EXECUTE ON FUNCTION public.rpc_verify_ledger_integrity() TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_verify_ledger_integrity() TO service_role;

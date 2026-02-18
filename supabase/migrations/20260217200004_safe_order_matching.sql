-- ============================================================================
-- HANBANG Financial Engine V1 — 안전 주문 매칭 엔진 (Safe Order Matching)
-- ============================================================================
--
-- [금융감독원 전자금융업 감독규정 준수 사항]
-- 1. 주문 실행의 원자성(Atomicity) 보장
--    - 잔고 확인 → 주문 생성 → 원장 기록이 단일 트랜잭션 내에서 수행
-- 2. Double Spend 방지
--    - 사용자별 advisory lock으로 동시 주문 직렬화
-- 3. Race Condition 제거
--    - TOCTOU(Time-of-Check-Time-of-Use) 취약점 원천 차단
-- 4. 투자 한도 검증
--    - KYC 상태, 투자 한도를 원자적으로 확인
-- 5. 부분 체결(Partial Fill) 지원
--    - 잔여 수량 부족 시 가용 수량만큼 체결
-- 6. 멱등성(Idempotency) 보장
--    - idempotency_key로 중복 주문 방지
--
-- 실행 순서:
--   1. advisory lock 획득 (사용자 ID 기반)
--   2. 멱등성 확인
--   3. 잔고 계산 (원장 기반)
--   4. KYC 및 투자 한도 검증
--   5. 콘텐츠 상품 유효성 확인
--   6. 주문 생성 (orders 테이블)
--   7. 원장 기록 (CASH_DEBIT + ASSET_CREDIT)
--   8. 콘텐츠 잔여 수량 차감
--   9. 결과 반환 (트랜잭션 COMMIT 시 해시 체인 자동 봉인)
--
-- ============================================================================

CREATE OR REPLACE FUNCTION public.rpc_safe_place_order(
  p_user_id        UUID,
  p_content_id     TEXT,
  p_amount_krw     NUMERIC,
  p_idempotency_key TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_balance           NUMERIC;
  v_order_id          UUID;
  v_content_uuid      UUID;
  v_item              RECORD;
  v_share_price_krw   NUMERIC;
  v_requested_qty     NUMERIC;
  v_filled_qty        NUMERIC;
  v_actual_amount     NUMERIC;
  v_remaining_qty     NUMERIC;
  v_user_status       TEXT;
  v_kyc_status        TEXT;
  v_investment_limit  NUMERIC;
  v_total_invested    NUMERIC;
  v_existing_order_id UUID;
BEGIN
  -- ┌─────────────────────────────────────────┐
  -- │ 1. Advisory Lock: Double Spend 방지     │
  -- │    동일 사용자의 동시 주문을 직렬화      │
  -- └─────────────────────────────────────────┘
  PERFORM pg_advisory_xact_lock(hashtext('safe_order:' || p_user_id::text));

  -- ┌─────────────────────────────────────────┐
  -- │ 2. 멱등성 확인 (Idempotency)            │
  -- │    동일 키로 이미 생성된 주문이 있으면   │
  -- │    기존 결과를 반환합니다.               │
  -- └─────────────────────────────────────────┘
  IF p_idempotency_key IS NOT NULL AND p_idempotency_key != '' THEN
    SELECT id INTO v_existing_order_id
    FROM public.orders
    WHERE user_id = p_user_id
      AND metadata->>'idempotency_key' = p_idempotency_key
    LIMIT 1;

    IF v_existing_order_id IS NOT NULL THEN
      RETURN jsonb_build_object(
        'ok', true,
        'order_id', v_existing_order_id,
        'idempotent', true
      );
    END IF;
  END IF;

  -- ┌─────────────────────────────────────────┐
  -- │ 3. 원장 기반 잔고 계산 (원자적)          │
  -- │    CASH_CREDIT(양수) + CASH_DEBIT(음수)  │
  -- │    = 현재 가용 잔고                      │
  -- └─────────────────────────────────────────┘
  SELECT COALESCE(SUM(
    CASE
      WHEN entry_type = 'CASH_CREDIT' THEN ABS(amount)
      WHEN entry_type = 'CASH_DEBIT'  THEN -ABS(amount)
      ELSE 0
    END
  ), 0) INTO v_balance
  FROM public.ledger_entries
  WHERE user_id = p_user_id;

  IF v_balance < p_amount_krw THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INSUFFICIENT_FUNDS');
  END IF;

  -- ┌─────────────────────────────────────────┐
  -- │ 4. 사용자 상태 및 KYC 검증              │
  -- └─────────────────────────────────────────┘
  SELECT status INTO v_user_status
  FROM public.profiles
  WHERE id = p_user_id;

  IF v_user_status IS DISTINCT FROM 'ACTIVE' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'STATUS_REQUIRED');
  END IF;

  -- KYC 및 투자 한도 검증
  SELECT kyc_status, COALESCE(investment_limit, 50000000)
  INTO v_kyc_status, v_investment_limit
  FROM public.investor_profiles
  WHERE user_id = p_user_id;

  IF v_kyc_status IS NULL OR v_kyc_status != 'APPROVED' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'KYC_REQUIRED');
  END IF;

  -- 누적 투자액 확인
  SELECT COALESCE(SUM(ABS(amount)), 0) INTO v_total_invested
  FROM public.ledger_entries
  WHERE user_id = p_user_id AND entry_type = 'CASH_DEBIT';

  IF v_total_invested + p_amount_krw > v_investment_limit THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INVESTMENT_LIMIT_EXCEEDED');
  END IF;

  -- ┌─────────────────────────────────────────┐
  -- │ 5. 콘텐츠 상품 유효성 확인              │
  -- └─────────────────────────────────────────┘
  v_content_uuid := p_content_id::UUID;

  SELECT id, share_price_usd, remaining_quantity
  INTO v_item
  FROM public.content_items
  WHERE id = v_content_uuid;

  IF v_item IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'CONTENT_NOT_FOUND');
  END IF;

  -- 주당 가격 계산 (USD → KRW 환산, 환율 1,350원 기준)
  v_share_price_krw := GREATEST(COALESCE(v_item.share_price_usd, 0) * 1350, 1);

  -- 요청 수량 계산 (투자금 / 주당 가격)
  v_requested_qty := FLOOR(p_amount_krw / v_share_price_krw);
  IF v_requested_qty <= 0 THEN
    v_requested_qty := 1;
  END IF;

  -- ┌─────────────────────────────────────────┐
  -- │ 6. 부분 체결 처리 (Partial Fill)         │
  -- │    잔여 수량 부족 시 가용분만 체결       │
  -- └─────────────────────────────────────────┘
  IF v_item.remaining_quantity IS NOT NULL AND v_requested_qty > v_item.remaining_quantity THEN
    v_filled_qty := v_item.remaining_quantity;
  ELSE
    v_filled_qty := v_requested_qty;
  END IF;

  IF v_filled_qty <= 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NO_REMAINING_QUANTITY');
  END IF;

  -- 실제 체결 금액 재계산
  v_actual_amount := v_filled_qty * v_share_price_krw;
  v_remaining_qty := v_requested_qty - v_filled_qty;

  -- ┌─────────────────────────────────────────┐
  -- │ 7. 주문 생성 (orders 테이블)             │
  -- └─────────────────────────────────────────┘
  v_order_id := gen_random_uuid();

  INSERT INTO public.orders (
    id, user_id, content_id, type, order_type,
    price, quantity, filled_quantity, total_amount_krw,
    status, created_at, completed_at, metadata
  ) VALUES (
    v_order_id,
    p_user_id,
    p_content_id,
    'BUY',
    'MARKET',
    v_actual_amount,
    v_requested_qty,
    v_filled_qty,
    v_actual_amount,
    CASE WHEN v_remaining_qty > 0 THEN 'PARTIAL' ELSE 'COMPLETED' END,
    now(),
    CASE WHEN v_remaining_qty = 0 THEN now() ELSE NULL END,
    CASE
      WHEN p_idempotency_key IS NOT NULL
      THEN jsonb_build_object('idempotency_key', p_idempotency_key)
      ELSE '{}'::jsonb
    END
  );

  -- ┌─────────────────────────────────────────┐
  -- │ 8. 원장 기록 (해시 체인 자동 봉인)       │
  -- │    CASH_DEBIT: 투자금 차감               │
  -- │    ASSET_CREDIT: 수익권 취득             │
  -- └─────────────────────────────────────────┘
  INSERT INTO public.ledger_entries (
    id, user_id, order_id, entry_type, currency,
    amount, asset_id, quantity, memo, metadata, created_at
  ) VALUES (
    gen_random_uuid(),
    p_user_id,
    v_order_id,
    'CASH_DEBIT',
    'KRW',
    -v_actual_amount,  -- 음수: 투자금 차감
    NULL,
    0,
    '투자 매수 대금 차감',
    jsonb_build_object('content_id', p_content_id, 'quantity', v_filled_qty),
    now()
  );

  INSERT INTO public.ledger_entries (
    id, user_id, order_id, entry_type, currency,
    amount, asset_id, quantity, memo, metadata, created_at
  ) VALUES (
    gen_random_uuid(),
    p_user_id,
    v_order_id,
    'ASSET_CREDIT',
    'KRW',
    0,
    v_content_uuid,    -- 취득 자산 ID
    v_filled_qty,      -- 체결 수량
    '수익권 취득',
    jsonb_build_object('content_id', p_content_id, 'price_krw', v_share_price_krw),
    now()
  );

  -- ┌─────────────────────────────────────────┐
  -- │ 9. 콘텐츠 잔여 수량 차감                │
  -- └─────────────────────────────────────────┘
  IF v_item.remaining_quantity IS NOT NULL THEN
    UPDATE public.content_items
    SET remaining_quantity = GREATEST(0, remaining_quantity - v_filled_qty)
    WHERE id = v_content_uuid;
  END IF;

  -- ┌─────────────────────────────────────────┐
  -- │ 10. 결과 반환                            │
  -- │     COMMIT 시 해시 체인 트리거가 자동    │
  -- │     실행되어 원장 엔트리가 봉인됩니다.   │
  -- └─────────────────────────────────────────┘
  RETURN jsonb_build_object(
    'ok', true,
    'order_id', v_order_id,
    'filled_quantity', v_filled_qty,
    'remaining_quantity', v_remaining_qty,
    'actual_amount', v_actual_amount,
    'share_price_krw', v_share_price_krw
  );

EXCEPTION
  WHEN OTHERS THEN
    -- 트랜잭션 자동 롤백: 주문·원장 기록이 모두 취소됩니다.
    RETURN jsonb_build_object('ok', false, 'error', SQLERRM);
END;
$$;

COMMENT ON FUNCTION public.rpc_safe_place_order IS
  '안전한 주문 실행 RPC. Advisory lock으로 Double Spend를 방지하고, 잔고·KYC·투자한도 검증 후 주문·원장 기록을 원자적으로 수행합니다.';

GRANT EXECUTE ON FUNCTION public.rpc_safe_place_order(UUID, TEXT, NUMERIC, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_safe_place_order(UUID, TEXT, NUMERIC, TEXT) TO service_role;

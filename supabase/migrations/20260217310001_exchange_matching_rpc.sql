-- ============================================================================
-- HANBANG Exchange V2 — 매칭 엔진 RPC (Place + Match + Cancel + Hold/Release)
-- ============================================================================
--
-- [금융감독원 전자금융업 감독규정 준수]
-- 1. 주문 + 잔고 HOLD + 매칭 + 체결 원장 기록을 단일 트랜잭션에서 원자적 수행
-- 2. Advisory Lock: market lock + user lock으로 Double Spend/Race Condition 방지
-- 3. Price-Time Priority: maker 가격 우선, 동일 가격은 시간 우선
-- 4. Partial Fill: 부분 체결 지원, 잔량은 오더북에 유지
-- 5. 멱등성: idempotency_key 기반 중복 주문 방지
-- 6. HOLD 회계: 주문 시 자금/자산 HOLD, 체결 시 정산, 취소 시 RELEASE
--
-- entry_type 확장:
--   CASH_HOLD    → 매수 주문 시 현금 동결
--   CASH_RELEASE → 취소/부분체결 잔여분 해제
--   ASSET_HOLD   → 매도 주문 시 자산 동결
--   ASSET_RELEASE→ 취소/부분체결 잔여분 해제
--
-- ============================================================================

-- ─────────────────────────────────────────────
-- 0. entry_type 허용 목록 확장
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.fn_ledger_entry_type_check()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.entry_type NOT IN (
    'CASH_DEBIT', 'CASH_CREDIT', 'ASSET_CREDIT', 'ASSET_DEBIT',
    'DIVIDEND', 'PRODUCT_PURCHASE', 'PRODUCT_SELL', 'TRADE_BUY', 'TRADE_SELL',
    'SIM_DEPOSIT', 'SIM_RESET', 'SETTLEMENT_SEAL',
    'CASH_HOLD', 'CASH_RELEASE', 'ASSET_HOLD', 'ASSET_RELEASE',
    'DIVIDEND_CREDIT'
  ) THEN
    RAISE EXCEPTION 'LEDGER_INVALID_ENTRY_TYPE: % not allowed', NEW.entry_type;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────────
-- 0b. 금액 체크 확장 (HOLD/RELEASE 허용)
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.fn_ledger_amount_check()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.entry_type IN ('CASH_CREDIT', 'ASSET_CREDIT', 'CASH_RELEASE', 'DIVIDEND_CREDIT') AND COALESCE(NEW.amount, 0) < 0 THEN
    RAISE EXCEPTION 'LEDGER_INVALID_AMOUNT: CREDIT/RELEASE types require amount >= 0';
  END IF;
  IF NEW.entry_type IN ('CASH_DEBIT', 'CASH_HOLD') AND COALESCE(NEW.amount, 0) > 0 THEN
    RAISE EXCEPTION 'LEDGER_INVALID_AMOUNT: DEBIT/HOLD requires amount <= 0';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────────
-- 0c. positions 트리거 — HOLD/RELEASE는 무시
-- ─────────────────────────────────────────────

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
  -- HOLD/RELEASE는 포지션에 반영하지 않음
  IF NEW.entry_type IN ('CASH_HOLD', 'CASH_RELEASE', 'ASSET_HOLD', 'ASSET_RELEASE') THEN
    RETURN NEW;
  END IF;

  -- ASSET_CREDIT: 자산 취득 (매수)
  IF NEW.entry_type IN ('ASSET_CREDIT', 'TRADE_BUY', 'PRODUCT_PURCHASE')
     AND NEW.asset_id IS NOT NULL
     AND NEW.quantity > 0
  THEN
    SELECT COALESCE(ABS(SUM(amount)), 0) INTO v_total_cost
    FROM public.ledger_entries
    WHERE order_id = NEW.order_id
      AND entry_type = 'CASH_DEBIT'
      AND order_id IS NOT NULL;

    IF v_total_cost = 0 OR v_total_cost IS NULL THEN
      v_total_cost := 0;
    END IF;

    v_cost_per_unit := CASE
      WHEN NEW.quantity > 0 THEN v_total_cost / NEW.quantity
      ELSE 0
    END;

    INSERT INTO public.positions (user_id, asset_id, quantity, avg_price, total_cost, realized_pnl)
    VALUES (NEW.user_id, NEW.asset_id, NEW.quantity, v_cost_per_unit, v_total_cost, 0)
    ON CONFLICT (user_id, asset_id)
    DO UPDATE SET
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
    SELECT quantity, avg_price, realized_pnl
    INTO v_existing
    FROM public.positions
    WHERE user_id = NEW.user_id AND asset_id = NEW.asset_id;

    IF v_existing IS NOT NULL AND v_existing.quantity > 0 THEN
      SELECT COALESCE(SUM(amount), 0) INTO v_sale_proceeds
      FROM public.ledger_entries
      WHERE order_id = NEW.order_id
        AND entry_type = 'CASH_CREDIT'
        AND order_id IS NOT NULL;

      v_sell_price := CASE
        WHEN NEW.quantity > 0 THEN v_sale_proceeds / NEW.quantity
        ELSE 0
      END;

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

-- ─────────────────────────────────────────────
-- 1. 잔고 계산 헬퍼 (가용 현금: 총 현금 - HOLD분)
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.fn_available_cash(p_user_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  v_bal NUMERIC;
BEGIN
  SELECT COALESCE(SUM(
    CASE
      WHEN entry_type = 'CASH_CREDIT'    THEN ABS(amount)
      WHEN entry_type = 'DIVIDEND_CREDIT' THEN ABS(amount)
      WHEN entry_type = 'CASH_RELEASE'   THEN ABS(amount)
      WHEN entry_type = 'CASH_DEBIT'     THEN -ABS(amount)
      WHEN entry_type = 'CASH_HOLD'      THEN -ABS(amount)
      ELSE 0
    END
  ), 0) INTO v_bal
  FROM public.ledger_entries
  WHERE user_id = p_user_id;
  RETURN v_bal;
END;
$$;

-- 가용 자산 수량 (보유 - HOLD분)
CREATE OR REPLACE FUNCTION public.fn_available_asset(p_user_id UUID, p_asset_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  v_qty NUMERIC;
BEGIN
  SELECT COALESCE(SUM(
    CASE
      WHEN entry_type IN ('ASSET_CREDIT','TRADE_BUY','PRODUCT_PURCHASE') THEN quantity
      WHEN entry_type = 'ASSET_RELEASE' THEN quantity
      WHEN entry_type IN ('ASSET_DEBIT','TRADE_SELL','PRODUCT_SELL')   THEN -quantity
      WHEN entry_type = 'ASSET_HOLD' THEN -quantity
      ELSE 0
    END
  ), 0) INTO v_qty
  FROM public.ledger_entries
  WHERE user_id = p_user_id AND asset_id = p_asset_id;
  RETURN v_qty;
END;
$$;

-- ─────────────────────────────────────────────
-- 2. 내부 매칭 함수: fn_match_order
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.fn_match_order(p_taker_order_id UUID)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_taker        RECORD;
  v_maker        RECORD;
  v_match_qty    NUMERIC;
  v_match_price  NUMERIC;
  v_match_value  NUMERIC;
  v_fills        INT := 0;
  v_total_filled NUMERIC := 0;
  v_total_value  NUMERIC := 0;
  v_trade_id     UUID;
BEGIN
  SELECT * INTO v_taker FROM public.exchange_orders WHERE id = p_taker_order_id;
  IF v_taker IS NULL THEN RETURN jsonb_build_object('fills', 0); END IF;

  -- 매칭 루프: Price-Time Priority
  FOR v_maker IN
    SELECT * FROM public.exchange_orders
    WHERE asset_id = v_taker.asset_id
      AND status IN ('OPEN', 'PARTIALLY_FILLED')
      AND id != v_taker.id
      AND side != v_taker.side
      AND order_type = 'LIMIT'
      AND CASE
        WHEN v_taker.side = 'BUY' AND v_taker.order_type = 'LIMIT'
          THEN price <= v_taker.price
        WHEN v_taker.side = 'BUY' AND v_taker.order_type = 'MARKET'
          THEN TRUE
        WHEN v_taker.side = 'SELL' AND v_taker.order_type = 'LIMIT'
          THEN price >= v_taker.price
        WHEN v_taker.side = 'SELL' AND v_taker.order_type = 'MARKET'
          THEN TRUE
        ELSE FALSE
      END
    ORDER BY
      CASE WHEN v_taker.side = 'BUY' THEN price END ASC,
      CASE WHEN v_taker.side = 'SELL' THEN price END DESC,
      created_at ASC
  LOOP
    -- taker 잔량 확인
    IF v_taker.order_type = 'MARKET' AND v_taker.side = 'BUY' THEN
      IF v_taker.remaining_amount <= 0 THEN EXIT; END IF;
    ELSE
      IF v_taker.remaining_qty <= 0 THEN EXIT; END IF;
    END IF;

    -- 체결 가격 = maker 가격
    v_match_price := v_maker.price;

    -- 체결 수량 산정
    IF v_taker.order_type = 'MARKET' AND v_taker.side = 'BUY' THEN
      v_match_qty := LEAST(
        v_maker.remaining_qty,
        FLOOR(v_taker.remaining_amount / v_match_price * 1000000) / 1000000
      );
    ELSE
      v_match_qty := LEAST(v_taker.remaining_qty, v_maker.remaining_qty);
    END IF;

    IF v_match_qty <= 0 THEN CONTINUE; END IF;

    v_match_value := v_match_qty * v_match_price;

    -- 체결 기록
    v_trade_id := gen_random_uuid();
    INSERT INTO public.exchange_trades (
      id, asset_id, price, quantity,
      maker_order_id, taker_order_id,
      maker_user_id, taker_user_id, taker_side
    ) VALUES (
      v_trade_id, v_taker.asset_id, v_match_price, v_match_qty,
      v_maker.id, v_taker.id,
      v_maker.user_id, v_taker.user_id, v_taker.side
    );

    -- 원장 기록: buyer/seller 정산
    IF v_taker.side = 'BUY' THEN
      -- buyer(taker): CASH_DEBIT + ASSET_CREDIT
      INSERT INTO public.ledger_entries (id, user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata, created_at)
      VALUES (gen_random_uuid(), v_taker.user_id, v_taker.id, 'CASH_DEBIT', 'KRW', -v_match_value, NULL, 0, '거래소 매수 체결', jsonb_build_object('trade_id', v_trade_id), now());
      INSERT INTO public.ledger_entries (id, user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata, created_at)
      VALUES (gen_random_uuid(), v_taker.user_id, v_taker.id, 'ASSET_CREDIT', 'KRW', 0, v_taker.asset_id, v_match_qty, '거래소 매수 체결', jsonb_build_object('trade_id', v_trade_id), now());
      -- seller(maker): ASSET_DEBIT + CASH_CREDIT
      INSERT INTO public.ledger_entries (id, user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata, created_at)
      VALUES (gen_random_uuid(), v_maker.user_id, v_maker.id, 'ASSET_DEBIT', 'KRW', 0, v_taker.asset_id, v_match_qty, '거래소 매도 체결', jsonb_build_object('trade_id', v_trade_id), now());
      INSERT INTO public.ledger_entries (id, user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata, created_at)
      VALUES (gen_random_uuid(), v_maker.user_id, v_maker.id, 'CASH_CREDIT', 'KRW', v_match_value, NULL, 0, '거래소 매도 체결', jsonb_build_object('trade_id', v_trade_id), now());
    ELSE
      -- seller(taker): ASSET_DEBIT + CASH_CREDIT
      INSERT INTO public.ledger_entries (id, user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata, created_at)
      VALUES (gen_random_uuid(), v_taker.user_id, v_taker.id, 'ASSET_DEBIT', 'KRW', 0, v_taker.asset_id, v_match_qty, '거래소 매도 체결', jsonb_build_object('trade_id', v_trade_id), now());
      INSERT INTO public.ledger_entries (id, user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata, created_at)
      VALUES (gen_random_uuid(), v_taker.user_id, v_taker.id, 'CASH_CREDIT', 'KRW', v_match_value, NULL, 0, '거래소 매도 체결', jsonb_build_object('trade_id', v_trade_id), now());
      -- buyer(maker): CASH_DEBIT + ASSET_CREDIT
      INSERT INTO public.ledger_entries (id, user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata, created_at)
      VALUES (gen_random_uuid(), v_maker.user_id, v_maker.id, 'CASH_DEBIT', 'KRW', -v_match_value, NULL, 0, '거래소 매수 체결', jsonb_build_object('trade_id', v_trade_id), now());
      INSERT INTO public.ledger_entries (id, user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata, created_at)
      VALUES (gen_random_uuid(), v_maker.user_id, v_maker.id, 'ASSET_CREDIT', 'KRW', 0, v_taker.asset_id, v_match_qty, '거래소 매수 체결', jsonb_build_object('trade_id', v_trade_id), now());
    END IF;

    -- 주문 잔량 갱신
    UPDATE public.exchange_orders SET
      remaining_qty = GREATEST(0, remaining_qty - v_match_qty),
      status = CASE WHEN remaining_qty - v_match_qty <= 0 THEN 'FILLED' ELSE 'PARTIALLY_FILLED' END,
      updated_at = now()
    WHERE id = v_maker.id;

    IF v_taker.order_type = 'MARKET' AND v_taker.side = 'BUY' THEN
      v_taker.remaining_amount := v_taker.remaining_amount - v_match_value;
      UPDATE public.exchange_orders SET
        remaining_amount = GREATEST(0, remaining_amount - v_match_value),
        remaining_qty = GREATEST(0, remaining_qty - v_match_qty),
        status = CASE WHEN remaining_amount - v_match_value <= 0 THEN 'FILLED' ELSE 'PARTIALLY_FILLED' END,
        updated_at = now()
      WHERE id = v_taker.id;
    ELSE
      v_taker.remaining_qty := v_taker.remaining_qty - v_match_qty;
      UPDATE public.exchange_orders SET
        remaining_qty = GREATEST(0, remaining_qty - v_match_qty),
        status = CASE WHEN remaining_qty - v_match_qty <= 0 THEN 'FILLED' ELSE 'PARTIALLY_FILLED' END,
        updated_at = now()
      WHERE id = v_taker.id;
    END IF;

    -- HOLD 해제: maker가 SELL인 경우 ASSET_RELEASE
    IF v_maker.side = 'SELL' THEN
      INSERT INTO public.ledger_entries (id, user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, created_at)
      VALUES (gen_random_uuid(), v_maker.user_id, v_maker.id, 'ASSET_RELEASE', 'KRW', 0, v_taker.asset_id, v_match_qty, 'HOLD 해제(체결)', now());
    ELSE
      INSERT INTO public.ledger_entries (id, user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, created_at)
      VALUES (gen_random_uuid(), v_maker.user_id, v_maker.id, 'CASH_RELEASE', 'KRW', v_match_value, NULL, 0, 'HOLD 해제(체결)', now());
    END IF;

    v_fills := v_fills + 1;
    v_total_filled := v_total_filled + v_match_qty;
    v_total_value := v_total_value + v_match_value;
  END LOOP;

  RETURN jsonb_build_object(
    'fills', v_fills,
    'total_filled', v_total_filled,
    'total_value', v_total_value,
    'avg_price', CASE WHEN v_total_filled > 0 THEN v_total_value / v_total_filled ELSE 0 END
  );
END;
$$;

-- ─────────────────────────────────────────────
-- 3. RPC: rpc_exchange_place_order
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.rpc_exchange_place_order(
  p_user_id         UUID,
  p_asset_id        UUID,
  p_side            TEXT,
  p_order_type      TEXT,
  p_price           NUMERIC DEFAULT NULL,
  p_quantity        NUMERIC DEFAULT NULL,
  p_amount_max      NUMERIC DEFAULT NULL,
  p_idempotency_key TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_order_id       UUID;
  v_hold_amount    NUMERIC;
  v_available      NUMERIC;
  v_existing       UUID;
  v_match_result   JSONB;
  v_final_status   TEXT;
BEGIN
  -- 1) User lock + Market lock
  PERFORM pg_advisory_xact_lock(hashtext('exuser:' || p_user_id::text));
  PERFORM pg_advisory_xact_lock(hashtext('exmarket:' || p_asset_id::text));

  -- 2) 멱등성
  IF p_idempotency_key IS NOT NULL THEN
    SELECT id INTO v_existing FROM public.exchange_orders
    WHERE user_id = p_user_id AND idempotency_key = p_idempotency_key;
    IF v_existing IS NOT NULL THEN
      RETURN jsonb_build_object('ok', true, 'order_id', v_existing, 'idempotent', true);
    END IF;
  END IF;

  -- 3) 입력 검증
  IF p_side NOT IN ('BUY', 'SELL') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INVALID_SIDE');
  END IF;
  IF p_order_type NOT IN ('LIMIT', 'MARKET') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INVALID_ORDER_TYPE');
  END IF;
  IF p_order_type = 'LIMIT' AND (p_price IS NULL OR p_price <= 0) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PRICE_REQUIRED_FOR_LIMIT');
  END IF;
  IF p_order_type = 'LIMIT' AND (p_quantity IS NULL OR p_quantity <= 0) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'QUANTITY_REQUIRED_FOR_LIMIT');
  END IF;
  IF p_order_type = 'MARKET' AND p_side = 'BUY' AND (p_amount_max IS NULL OR p_amount_max <= 0) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'AMOUNT_MAX_REQUIRED_FOR_MARKET_BUY');
  END IF;
  IF p_order_type = 'MARKET' AND p_side = 'SELL' AND (p_quantity IS NULL OR p_quantity <= 0) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'QUANTITY_REQUIRED_FOR_MARKET_SELL');
  END IF;

  -- 4) 잔고/보유수량 검증 + HOLD
  IF p_side = 'BUY' THEN
    IF p_order_type = 'LIMIT' THEN
      v_hold_amount := p_price * p_quantity;
    ELSE
      v_hold_amount := p_amount_max;
    END IF;

    v_available := public.fn_available_cash(p_user_id);
    IF v_available < v_hold_amount THEN
      RETURN jsonb_build_object('ok', false, 'error', 'INSUFFICIENT_FUNDS');
    END IF;

    INSERT INTO public.ledger_entries (id, user_id, entry_type, currency, amount, memo, created_at)
    VALUES (gen_random_uuid(), p_user_id, 'CASH_HOLD', 'KRW', -v_hold_amount, '매수 주문 자금 동결', now());

  ELSE -- SELL
    v_available := public.fn_available_asset(p_user_id, p_asset_id);
    IF v_available < p_quantity THEN
      RETURN jsonb_build_object('ok', false, 'error', 'INSUFFICIENT_ASSETS');
    END IF;

    INSERT INTO public.ledger_entries (id, user_id, entry_type, currency, amount, asset_id, quantity, memo, created_at)
    VALUES (gen_random_uuid(), p_user_id, 'ASSET_HOLD', 'KRW', 0, p_asset_id, p_quantity, '매도 주문 자산 동결', now());
  END IF;

  -- 5) 주문 생성
  v_order_id := gen_random_uuid();
  INSERT INTO public.exchange_orders (
    id, user_id, asset_id, side, order_type, price, quantity,
    amount_max, remaining_qty, remaining_amount, status, idempotency_key
  ) VALUES (
    v_order_id, p_user_id, p_asset_id, p_side, p_order_type, p_price,
    COALESCE(p_quantity, 0), p_amount_max,
    COALESCE(p_quantity, 0),
    COALESCE(p_amount_max, 0),
    'OPEN', p_idempotency_key
  );

  -- 6) 매칭
  v_match_result := public.fn_match_order(v_order_id);

  -- 7) HOLD 해제: taker의 미사용 HOLD분
  SELECT status INTO v_final_status FROM public.exchange_orders WHERE id = v_order_id;

  IF v_final_status = 'FILLED' THEN
    IF p_side = 'BUY' THEN
      -- 시장가 매수 잔액 반환
      DECLARE v_rem_amt NUMERIC;
      BEGIN
        SELECT remaining_amount INTO v_rem_amt FROM public.exchange_orders WHERE id = v_order_id;
        IF v_rem_amt > 0 THEN
          INSERT INTO public.ledger_entries (id, user_id, entry_type, currency, amount, memo, created_at)
          VALUES (gen_random_uuid(), p_user_id, 'CASH_RELEASE', 'KRW', v_rem_amt, 'HOLD 잔액 반환(완전체결)', now());
        END IF;
      END;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'order_id', v_order_id,
    'status', v_final_status,
    'match_result', v_match_result
  );
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object('ok', false, 'error', 'DUPLICATE_ORDER');
  WHEN OTHERS THEN
    RETURN jsonb_build_object('ok', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_exchange_place_order(UUID, UUID, TEXT, TEXT, NUMERIC, NUMERIC, NUMERIC, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_exchange_place_order(UUID, UUID, TEXT, TEXT, NUMERIC, NUMERIC, NUMERIC, TEXT) TO service_role;

-- ─────────────────────────────────────────────
-- 4. RPC: rpc_exchange_cancel_order
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.rpc_exchange_cancel_order(
  p_user_id  UUID,
  p_order_id UUID
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_order RECORD;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('exuser:' || p_user_id::text));

  SELECT * INTO v_order FROM public.exchange_orders
  WHERE id = p_order_id AND user_id = p_user_id;

  IF v_order IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'ORDER_NOT_FOUND');
  END IF;

  IF v_order.status NOT IN ('OPEN', 'PARTIALLY_FILLED') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'ORDER_NOT_CANCELABLE');
  END IF;

  -- 상태 변경
  UPDATE public.exchange_orders SET status = 'CANCELED', updated_at = now() WHERE id = p_order_id;

  -- HOLD 전액 RELEASE
  IF v_order.side = 'BUY' THEN
    DECLARE v_hold_remaining NUMERIC;
    BEGIN
      IF v_order.order_type = 'MARKET' THEN
        v_hold_remaining := v_order.remaining_amount;
      ELSE
        v_hold_remaining := v_order.remaining_qty * v_order.price;
      END IF;
      IF v_hold_remaining > 0 THEN
        INSERT INTO public.ledger_entries (id, user_id, order_id, entry_type, currency, amount, memo, created_at)
        VALUES (gen_random_uuid(), p_user_id, p_order_id, 'CASH_RELEASE', 'KRW', v_hold_remaining, '주문 취소 HOLD 해제', now());
      END IF;
    END;
  ELSE
    IF v_order.remaining_qty > 0 THEN
      INSERT INTO public.ledger_entries (id, user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, created_at)
      VALUES (gen_random_uuid(), p_user_id, p_order_id, 'ASSET_RELEASE', 'KRW', 0, v_order.asset_id, v_order.remaining_qty, '주문 취소 HOLD 해제', now());
    END IF;
  END IF;

  RETURN jsonb_build_object('ok', true, 'order_id', p_order_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_exchange_cancel_order(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_exchange_cancel_order(UUID, UUID) TO service_role;

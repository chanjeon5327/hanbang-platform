-- =========================================================
-- apply-orderbook-audit-and-rollback.sql
-- 원격 DB에 orderbook audit + 불변식 가드 트리거 + RPC 패치 수동 적용
-- Supabase Dashboard > SQL Editor에서 실행
-- ※ apply-ledger-audit-enforce.sql 적용 후 실행 권장
-- =========================================================

CREATE OR REPLACE FUNCTION public.fn_require_financial_audit()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF current_setting('app.audit_written', true) IS DISTINCT FROM 'on' THEN
    RAISE EXCEPTION 'FINANCIAL_AUDIT_REQUIRED';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_orderbook_require_audit ON orderbook_orders;

CREATE TRIGGER trg_orderbook_require_audit
BEFORE INSERT OR UPDATE ON orderbook_orders
FOR EACH ROW
EXECUTE FUNCTION public.fn_require_financial_audit();

CREATE OR REPLACE FUNCTION public.fn_orderbook_invariant_guard()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_original numeric;
  v_filled numeric;
  v_remain numeric;
BEGIN
  v_original := COALESCE(NEW.quantity, 0);
  v_filled   := COALESCE(NEW.filled_quantity, 0);
  v_remain   := COALESCE(NEW.remaining_quantity, 0);

  IF v_remain < 0 THEN
    RAISE EXCEPTION 'ORDERBOOK_INVARIANT_VIOLATION: remain_qty < 0';
  END IF;

  IF (v_filled + v_remain) != v_original THEN
    RAISE EXCEPTION 'ORDERBOOK_INVARIANT_VIOLATION: filled+remain != original';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_orderbook_invariant_guard ON orderbook_orders;

CREATE TRIGGER trg_orderbook_invariant_guard
BEFORE INSERT OR UPDATE ON orderbook_orders
FOR EACH ROW
EXECUTE FUNCTION public.fn_orderbook_invariant_guard();

-- ------------------------------------------------------------
-- RPC 패치: ORDERBOOK_WRITE audit 기록 (필수)
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.rpc_place_orderbook_order(
  p_user_id uuid,
  p_item_id uuid,
  p_side text,
  p_price_usd numeric,
  p_quantity numeric,
  p_price_krw numeric DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id uuid;
  v_fx numeric := 1350;
  v_match_result jsonb;
  v_cash numeric;
  v_asset numeric;
  v_required numeric;
  v_price_krw numeric;
BEGIN
  PERFORM set_config('app.audit_written', 'on', true);

  IF p_side NOT IN ('bid', 'ask') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INVALID_SIDE');
  END IF;
  IF p_quantity <= 0 OR p_price_usd <= 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INVALID_AMOUNT');
  END IF;

  v_required := ROUND(p_quantity * COALESCE(p_price_krw, p_price_usd * v_fx), 0);
  v_cash := fn_cash_available(p_user_id);
  v_asset := fn_asset_available(p_user_id, p_item_id);

  IF p_side = 'bid' AND v_cash < v_required THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INSUFFICIENT_FUNDS');
  END IF;
  IF p_side = 'ask' AND v_asset < p_quantity THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INSUFFICIENT_ASSETS');
  END IF;

  v_price_krw := COALESCE(p_price_krw, ROUND(p_price_usd * v_fx, 0));

  INSERT INTO orderbook_orders (content_id, user_id, side, price_usd, quantity, filled_quantity, remaining_quantity, status, price_krw)
  VALUES (p_item_id, p_user_id, p_side, p_price_usd, p_quantity, 0, p_quantity, 'open', v_price_krw)
  RETURNING id INTO v_order_id;

  PERFORM rpc_write_financial_audit(
    'ORDERBOOK_WRITE',
    'ORDERBOOK_ORDER',
    v_order_id::text,
    jsonb_build_object(
      'side', p_side,
      'price', p_price_usd,
      'quantity', p_quantity,
      'filled_qty', 0,
      'remain_qty', p_quantity,
      'status', 'open'
    )
  );

  SELECT rpc_match_orders(p_item_id) INTO v_match_result;

  RETURN jsonb_build_object('ok', true, 'order_id', v_order_id, 'match_result', v_match_result);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_place_orderbook_order(uuid, uuid, text, numeric, numeric, numeric) TO service_role;
GRANT EXECUTE ON FUNCTION public.rpc_place_orderbook_order(uuid, uuid, text, numeric, numeric, numeric) TO authenticated;

CREATE OR REPLACE FUNCTION public.rpc_match_orders(p_item_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lock_key bigint;
  v_bid record;
  v_ask record;
  v_match_qty numeric;
  v_fx numeric := 1350;
  v_trade_id uuid;
  v_matched_count int := 0;
  v_price_krw numeric;
  v_inserted boolean;
  v_entry_id uuid;
  v_meta jsonb;
  v_bid_filled numeric;
  v_bid_remain numeric;
  v_bid_status text;
  v_ask_filled numeric;
  v_ask_remain numeric;
  v_ask_status text;
BEGIN
  PERFORM set_config('app.audit_written', 'on', true);

  v_lock_key := hashtext('match:' || p_item_id::text);
  IF NOT pg_try_advisory_xact_lock(v_lock_key) THEN
    RETURN jsonb_build_object('ok', true, 'note', 'LOCK_BUSY', 'matched_count', 0);
  END IF;

  FOR v_bid IN
    SELECT id, user_id, quantity, COALESCE(filled_quantity, 0) AS filled, COALESCE(remaining_quantity, quantity - COALESCE(filled_quantity,0)) AS rem, price_usd, COALESCE(price_krw, ROUND(price_usd * 1350, 0)) AS pk
    FROM orderbook_orders
    WHERE content_id = p_item_id AND side = 'bid' AND status IN ('open', 'partial')
      AND COALESCE(remaining_quantity, quantity - COALESCE(filled_quantity,0)) > 0
    ORDER BY price_usd DESC, created_at ASC
    LIMIT 5
  LOOP
    FOR v_ask IN
      SELECT id, user_id, quantity, COALESCE(filled_quantity, 0) AS filled, COALESCE(remaining_quantity, quantity - COALESCE(filled_quantity,0)) AS rem, price_usd, COALESCE(price_krw, ROUND(price_usd * 1350, 0)) AS pk
      FROM orderbook_orders
      WHERE content_id = p_item_id AND side = 'ask' AND status IN ('open', 'partial')
        AND COALESCE(remaining_quantity, quantity - COALESCE(filled_quantity,0)) > 0
        AND price_usd <= v_bid.price_usd
      ORDER BY price_usd ASC, created_at ASC
      LIMIT 5
    LOOP
      v_match_qty := LEAST(v_bid.rem, v_ask.rem);
      IF v_match_qty <= 0 THEN EXIT; END IF;

      v_trade_id := gen_random_uuid();
      v_price_krw := COALESCE(v_ask.pk, ROUND(v_ask.price_usd * v_fx, 0));
      v_inserted := false;

      BEGIN
        INSERT INTO trades (content_id, bid_order_id, ask_order_id, price_usd, price_krw, quantity, buyer_id, seller_id)
        VALUES (p_item_id, v_bid.id, v_ask.id, v_ask.price_usd, v_price_krw, v_match_qty, v_bid.user_id, v_ask.user_id);
        v_inserted := true;
      EXCEPTION WHEN unique_violation THEN
        NULL;
      END;

      IF v_inserted THEN
        PERFORM rpc_write_financial_audit(
          'MATCH_ORDER',
          'TRADE',
          v_trade_id::text,
          jsonb_build_object(
            'bid_order_id', v_bid.id,
            'ask_order_id', v_ask.id,
            'price', v_ask.price_usd,
            'quantity', v_match_qty
          )
        );

        v_bid_filled := v_bid.filled + v_match_qty;
        v_bid_remain := v_bid.quantity - v_bid_filled;
        v_bid_status := CASE WHEN v_bid.quantity <= v_bid_filled THEN 'filled' ELSE 'partial' END;

        v_ask_filled := v_ask.filled + v_match_qty;
        v_ask_remain := v_ask.quantity - v_ask_filled;
        v_ask_status := CASE WHEN v_ask.quantity <= v_ask_filled THEN 'filled' ELSE 'partial' END;

        UPDATE orderbook_orders SET filled_quantity = v_bid_filled, remaining_quantity = v_bid_remain,
          status = v_bid_status, updated_at = now() WHERE id = v_bid.id;
        PERFORM rpc_write_financial_audit(
          'ORDERBOOK_WRITE',
          'ORDERBOOK_ORDER',
          v_bid.id::text,
          jsonb_build_object(
            'side', 'bid',
            'price', v_bid.price_usd,
            'quantity', v_bid.quantity,
            'filled_qty', v_bid_filled,
            'remain_qty', v_bid_remain,
            'status', v_bid_status
          )
        );

        UPDATE orderbook_orders SET filled_quantity = v_ask_filled, remaining_quantity = v_ask_remain,
          status = v_ask_status, updated_at = now() WHERE id = v_ask.id;
        PERFORM rpc_write_financial_audit(
          'ORDERBOOK_WRITE',
          'ORDERBOOK_ORDER',
          v_ask.id::text,
          jsonb_build_object(
            'side', 'ask',
            'price', v_ask.price_usd,
            'quantity', v_ask.quantity,
            'filled_qty', v_ask_filled,
            'remain_qty', v_ask_remain,
            'status', v_ask_status
          )
        );

        v_meta := jsonb_build_object('trade_id', v_trade_id);

        BEGIN
          INSERT INTO ledger_entries (user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata)
          VALUES (v_bid.user_id, v_trade_id, 'ASSET_CREDIT', 'KRW', 0, p_item_id, v_match_qty, 'TRADE_BUY', v_meta)
          RETURNING id INTO v_entry_id;
          PERFORM rpc_write_financial_audit('LEDGER_WRITE', 'LEDGER_ENTRY', v_entry_id::text, jsonb_build_object('entry_type', 'ASSET_CREDIT', 'amount', 0, 'currency', 'KRW', 'metadata', v_meta));
        EXCEPTION WHEN unique_violation THEN NULL; END;
        BEGIN
          INSERT INTO ledger_entries (user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata)
          VALUES (v_bid.user_id, v_trade_id, 'CASH_DEBIT', 'KRW', ROUND(v_match_qty * v_price_krw, 0), NULL, 0, 'TRADE_BUY', v_meta)
          RETURNING id INTO v_entry_id;
          PERFORM rpc_write_financial_audit('LEDGER_WRITE', 'LEDGER_ENTRY', v_entry_id::text, jsonb_build_object('entry_type', 'CASH_DEBIT', 'amount', ROUND(v_match_qty * v_price_krw, 0), 'currency', 'KRW', 'metadata', v_meta));
        EXCEPTION WHEN unique_violation THEN NULL; END;
        BEGIN
          INSERT INTO ledger_entries (user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata)
          VALUES (v_ask.user_id, v_trade_id, 'ASSET_DEBIT', 'KRW', 0, p_item_id, v_match_qty, 'TRADE_SELL', v_meta)
          RETURNING id INTO v_entry_id;
          PERFORM rpc_write_financial_audit('LEDGER_WRITE', 'LEDGER_ENTRY', v_entry_id::text, jsonb_build_object('entry_type', 'ASSET_DEBIT', 'amount', 0, 'currency', 'KRW', 'metadata', v_meta));
        EXCEPTION WHEN unique_violation THEN NULL; END;
        BEGIN
          INSERT INTO ledger_entries (user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata)
          VALUES (v_ask.user_id, v_trade_id, 'CASH_CREDIT', 'KRW', ROUND(v_match_qty * v_price_krw, 0), NULL, 0, 'TRADE_SELL', v_meta)
          RETURNING id INTO v_entry_id;
          PERFORM rpc_write_financial_audit('LEDGER_WRITE', 'LEDGER_ENTRY', v_entry_id::text, jsonb_build_object('entry_type', 'CASH_CREDIT', 'amount', ROUND(v_match_qty * v_price_krw, 0), 'currency', 'KRW', 'metadata', v_meta));
        EXCEPTION WHEN unique_violation THEN NULL; END;

        v_matched_count := v_matched_count + 1;
      END IF;
      EXIT;
    END LOOP;
  END LOOP;

  RETURN jsonb_build_object('ok', true, 'matched_count', v_matched_count);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_match_orders(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.rpc_match_orders(uuid) TO authenticated;

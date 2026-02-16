-- =========================================================
-- 20260340_ledger_audit_enforce.sql
-- ledger_entries audit 강제
-- =========================================================

-- ledger도 audit 없이 변경 못 하게 막는다.
-- (trades에서 만든 fn_require_financial_audit 재사용)

-- 혹시 trades 단계에서 fn_require_financial_audit가 없다면 안전하게 재정의
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

DROP TRIGGER IF EXISTS trg_ledger_require_audit ON ledger_entries;

CREATE TRIGGER trg_ledger_require_audit
BEFORE INSERT OR UPDATE ON ledger_entries
FOR EACH ROW
EXECUTE FUNCTION public.fn_require_financial_audit();

-- ------------------------------------------------------------
-- RPC 패치: audit 플래그 + LEDGER_WRITE audit 기록
-- ------------------------------------------------------------

-- rpc_place_orderbook_order: set_config 추가 (rpc_match_orders 호출 시 ledger INSERT 발생)
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

  INSERT INTO orderbook_orders (content_id, user_id, side, price_usd, quantity, filled_quantity, remaining_quantity, status, price_krw)
  VALUES (p_item_id, p_user_id, p_side, p_price_usd, p_quantity, 0, p_quantity, 'open', COALESCE(p_price_krw, ROUND(p_price_usd * v_fx, 0)))
  RETURNING id INTO v_order_id;

  SELECT rpc_match_orders(p_item_id) INTO v_match_result;

  RETURN jsonb_build_object('ok', true, 'order_id', v_order_id, 'match_result', v_match_result);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_place_orderbook_order(uuid, uuid, text, numeric, numeric, numeric) TO service_role;
GRANT EXECUTE ON FUNCTION public.rpc_place_orderbook_order(uuid, uuid, text, numeric, numeric, numeric) TO authenticated;

-- rpc_match_orders: ledger INSERT마다 LEDGER_WRITE audit 추가
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
BEGIN
  PERFORM set_config('app.audit_written', 'on', true);

  v_lock_key := hashtext('match:' || p_item_id::text);
  IF NOT pg_try_advisory_xact_lock(v_lock_key) THEN
    RETURN jsonb_build_object('ok', true, 'note', 'LOCK_BUSY', 'matched_count', 0);
  END IF;

  FOR v_bid IN
    SELECT id, user_id, quantity, COALESCE(remaining_quantity, quantity - COALESCE(filled_quantity,0)) AS rem, price_usd, COALESCE(price_krw, ROUND(price_usd * 1350, 0)) AS pk
    FROM orderbook_orders
    WHERE content_id = p_item_id AND side = 'bid' AND status IN ('open', 'partial')
      AND COALESCE(remaining_quantity, quantity - COALESCE(filled_quantity,0)) > 0
    ORDER BY price_usd DESC, created_at ASC
    LIMIT 5
  LOOP
    FOR v_ask IN
      SELECT id, user_id, quantity, COALESCE(remaining_quantity, quantity - COALESCE(filled_quantity,0)) AS rem, price_usd, COALESCE(price_krw, ROUND(price_usd * 1350, 0)) AS pk
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

        UPDATE orderbook_orders SET filled_quantity = COALESCE(filled_quantity, 0) + v_match_qty, remaining_quantity = quantity - (COALESCE(filled_quantity, 0) + v_match_qty),
          status = CASE WHEN quantity <= COALESCE(filled_quantity, 0) + v_match_qty THEN 'filled' ELSE 'partial' END, updated_at = now() WHERE id = v_bid.id;
        UPDATE orderbook_orders SET filled_quantity = COALESCE(filled_quantity, 0) + v_match_qty, remaining_quantity = quantity - (COALESCE(filled_quantity, 0) + v_match_qty),
          status = CASE WHEN quantity <= COALESCE(filled_quantity, 0) + v_match_qty THEN 'filled' ELSE 'partial' END, updated_at = now() WHERE id = v_ask.id;

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

-- rpc_finalize_order: set_config('app.audit_written') + LEDGER_WRITE audit
CREATE OR REPLACE FUNCTION public.rpc_finalize_order(p_order_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order record;
  v_cash_exists boolean;
  v_asset_exists boolean;
  v_user uuid;
  v_cash numeric(18,2);
  v_qty numeric(18,6);
  v_asset uuid;
  v_entry_id uuid;
BEGIN
  PERFORM set_config('app.allow_settlement', 'on', true);
  PERFORM set_config('app.audit_written', 'on', true);

  SELECT * INTO v_order FROM orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'ORDER_NOT_FOUND'; END IF;
  IF v_order.status <> 'PAID' THEN RAISE EXCEPTION 'ORDER_NOT_PAID'; END IF;

  SELECT EXISTS(SELECT 1 FROM ledger_entries WHERE order_id = p_order_id AND entry_type = 'CASH_DEBIT') INTO v_cash_exists;
  SELECT EXISTS(SELECT 1 FROM ledger_entries WHERE order_id = p_order_id AND entry_type = 'ASSET_CREDIT') INTO v_asset_exists;
  IF v_cash_exists OR v_asset_exists THEN
    RETURN jsonb_build_object('ok', true, 'order_id', p_order_id, 'status', 'COMPLETED', 'idempotent', true);
  END IF;

  v_user := COALESCE(v_order.user_id, v_order.buyer_id);
  v_cash := coalesce(v_order.total_amount_krw, 0);
  v_qty := coalesce(v_order.quantity, 0);
  v_asset := coalesce(v_order.product_id, (v_order.metadata->>'asset_id')::uuid);

  INSERT INTO ledger_entries (user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata)
  VALUES (v_user, p_order_id, 'CASH_DEBIT', 'KRW', (v_cash * -1), null, 0, 'Order completed: cash debit', '{}'::jsonb)
  RETURNING id INTO v_entry_id;
  PERFORM rpc_write_financial_audit('LEDGER_WRITE', 'LEDGER_ENTRY', v_entry_id::text, jsonb_build_object('entry_type', 'CASH_DEBIT', 'amount', (v_cash * -1), 'currency', 'KRW', 'metadata', '{}'::jsonb));

  INSERT INTO ledger_entries (user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata)
  VALUES (v_user, p_order_id, 'ASSET_CREDIT', 'KRW', 0, v_asset, v_qty, 'Order completed: asset credit', '{}'::jsonb)
  RETURNING id INTO v_entry_id;
  PERFORM rpc_write_financial_audit('LEDGER_WRITE', 'LEDGER_ENTRY', v_entry_id::text, jsonb_build_object('entry_type', 'ASSET_CREDIT', 'amount', 0, 'currency', 'KRW', 'metadata', '{}'::jsonb));

  UPDATE orders SET status = 'COMPLETED', completed_at = coalesce(completed_at, now()), ledger_posted_at = now() WHERE id = p_order_id;
  RETURN jsonb_build_object('ok', true);
END;
$$;

-- rpc_admin_confirm_settlement: set_config('app.audit_written') + ledger UPDATE 시 audit
CREATE OR REPLACE FUNCTION public.rpc_admin_confirm_settlement(p_batch_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.settlement_batches%ROWTYPE;
  v_lock_key bigint;
  v_updated_count int;
BEGIN
  v_lock_key := hashtext('settlement:' || p_batch_id::text);
  PERFORM pg_advisory_xact_lock(v_lock_key);

  PERFORM set_config('app.allow_settlement', 'on', true);
  PERFORM set_config('app.audit_written', 'on', true);

  SELECT * INTO v_row FROM public.settlement_batches WHERE id = p_batch_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'SETTLEMENT_BATCH_NOT_FOUND: 정산 배치를 찾을 수 없습니다.';
  END IF;

  IF v_row.confirmed_at IS NOT NULL THEN
    RETURN jsonb_build_object('ok', true, 'idempotent', true, 'confirmed_at', v_row.confirmed_at);
  END IF;

  UPDATE public.settlement_batches SET confirmed_at = now() WHERE id = p_batch_id AND confirmed_at IS NULL;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', true, 'idempotent', true);
  END IF;

  WITH updated AS (
    UPDATE public.ledger_entries
    SET ledger_posted_at = now()
    WHERE order_id IN (
      SELECT id FROM public.orders
      WHERE settlement_batch_id = p_batch_id
    )
    AND ledger_posted_at IS NULL
    RETURNING id
  )
  SELECT count(*)::int INTO v_updated_count FROM updated;

  PERFORM rpc_write_financial_audit(
    'LEDGER_WRITE',
    'LEDGER_ENTRY',
    p_batch_id::text,
    jsonb_build_object(
      'entry_type', 'SETTLEMENT_SEAL',
      'amount', 0,
      'currency', 'KRW',
      'metadata', jsonb_build_object('batch_id', p_batch_id, 'updated_count', v_updated_count)
    )
  );

  RETURN jsonb_build_object('ok', true, 'confirmed_at', now());
END;
$$;

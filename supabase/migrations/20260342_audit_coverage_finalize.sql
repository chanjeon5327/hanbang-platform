-- =========================================================
-- 20260342_audit_coverage_finalize.sql
-- Audit 강제 누락 루트 봉쇄: RPC 패치 + DB 트리거
-- =========================================================

-- fn_require_financial_audit 재정의 (없으면)
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

-- ------------------------------------------------------------
-- 1) settlement_batches audit 트리거
-- ------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_settlement_batches_require_audit ON public.settlement_batches;
CREATE TRIGGER trg_settlement_batches_require_audit
  BEFORE INSERT OR UPDATE ON public.settlement_batches
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_require_financial_audit();

-- ------------------------------------------------------------
-- 2) dividends audit 트리거
-- ------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_dividends_require_audit ON public.dividends;
CREATE TRIGGER trg_dividends_require_audit
  BEFORE INSERT OR UPDATE ON public.dividends
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_require_financial_audit();

-- ------------------------------------------------------------
-- 3) financial_audit_logs: RPC 통해서만 INSERT
-- ------------------------------------------------------------
REVOKE INSERT ON TABLE public.financial_audit_logs FROM anon;
REVOKE INSERT ON TABLE public.financial_audit_logs FROM authenticated;
-- service_role, postgres는 RPC(SECURITY DEFINER) 통해 insert 가능

-- ------------------------------------------------------------
-- 4) RPC 패치: rpc_invest_and_notify
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.rpc_invest_and_notify(
  p_user_id uuid,
  p_content_id uuid,
  p_amount_krw numeric,
  p_idempotency_key text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance numeric;
  v_order_id uuid;
  v_cash_exists boolean;
  v_now timestamptz;
  v_product_id uuid;
  v_entry_id uuid;
BEGIN
  PERFORM set_config('app.audit_written', 'on', true);

  v_now := now();

  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'FORBIDDEN: 본인만 투자 가능';
  END IF;

  IF p_amount_krw IS NULL OR p_amount_krw <= 0 THEN
    RAISE EXCEPTION 'INVALID_AMOUNT: 투자 금액은 0보다 커야 합니다.';
  END IF;

  IF p_idempotency_key IS NOT NULL AND p_idempotency_key <> '' THEN
    SELECT id INTO v_order_id
    FROM orders
    WHERE idempotency_key = p_idempotency_key AND user_id = p_user_id
    LIMIT 1;
    IF FOUND THEN
      RETURN jsonb_build_object('ok', true, 'order_id', v_order_id, 'idempotent', true);
    END IF;
  END IF;

  SELECT id INTO v_product_id FROM products WHERE content_id = p_content_id LIMIT 1;

  SELECT COALESCE(SUM(CASE WHEN entry_type = 'CASH_CREDIT' THEN amount ELSE 0 END), 0)
       - COALESCE(SUM(CASE WHEN entry_type = 'CASH_DEBIT' THEN ABS(amount) ELSE 0 END), 0)
  INTO v_balance
  FROM ledger_entries
  WHERE user_id = p_user_id;

  IF COALESCE(v_balance, 0) < p_amount_krw THEN
    RAISE EXCEPTION 'INSUFFICIENT_FUNDS: 잔액 부족';
  END IF;

  INSERT INTO orders (
    user_id, content_id, product_id, type, order_type, price, quantity, filled_quantity,
    status, completed_at, ledger_posted_at, total_amount_krw, idempotency_key
  ) VALUES (
    p_user_id, p_content_id, v_product_id, 'BUY', 'MARKET', p_amount_krw, 1, 1,
    'COMPLETED', v_now, v_now, p_amount_krw,
    CASE WHEN p_idempotency_key IS NOT NULL AND TRIM(p_idempotency_key) <> '' THEN TRIM(p_idempotency_key) ELSE NULL END
  )
  RETURNING id INTO v_order_id;

  IF v_order_id IS NULL THEN
    RAISE EXCEPTION 'ORDER_INSERT_FAILED';
  END IF;

  SELECT EXISTS(SELECT 1 FROM ledger_entries WHERE order_id = v_order_id AND entry_type = 'CASH_DEBIT') INTO v_cash_exists;
  IF NOT v_cash_exists THEN
    INSERT INTO ledger_entries (user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata)
    VALUES (p_user_id, v_order_id, 'CASH_DEBIT', 'KRW', (p_amount_krw * -1), NULL, 0, 'PRODUCT_PURCHASE', '{}'::jsonb)
    RETURNING id INTO v_entry_id;
    PERFORM rpc_write_financial_audit('LEDGER_WRITE', 'LEDGER_ENTRY', v_entry_id::text, jsonb_build_object('entry_type', 'CASH_DEBIT', 'amount', (p_amount_krw * -1), 'currency', 'KRW', 'metadata', '{}'::jsonb));

    INSERT INTO ledger_entries (user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata)
    VALUES (p_user_id, v_order_id, 'ASSET_CREDIT', 'KRW', 0, p_content_id, 1, 'PRODUCT_PURCHASE', '{}'::jsonb)
    RETURNING id INTO v_entry_id;
    PERFORM rpc_write_financial_audit('LEDGER_WRITE', 'LEDGER_ENTRY', v_entry_id::text, jsonb_build_object('entry_type', 'ASSET_CREDIT', 'amount', 0, 'currency', 'KRW', 'metadata', '{}'::jsonb));
  END IF;

  UPDATE content_items
  SET current_raise = COALESCE(current_raise, 0) + p_amount_krw
  WHERE id = p_content_id;

  INSERT INTO notifications (user_id, type, reference_id, message)
  VALUES (
    p_user_id,
    'INVEST_SUCCESS',
    p_content_id,
    format('₩%s 투자 완료', to_char(p_amount_krw, 'FM999,999,999'))
  );

  REFRESH MATERIALIZED VIEW CONCURRENTLY public.user_artist_contribution;
  PERFORM refresh_recommendation_mv();

  RETURN jsonb_build_object('ok', true, 'order_id', v_order_id);
END;
$$;

-- ------------------------------------------------------------
-- 5) RPC 패치: rpc_sell_content
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.rpc_sell_content(
  p_user_id uuid,
  p_content_id uuid,
  p_quantity numeric,
  p_idempotency_key text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_position numeric;
  v_share_price_usd numeric;
  v_fx_rate numeric := 1350;
  v_sell_amount_krw numeric;
  v_order_id uuid;
  v_asset_exists boolean;
  v_product_id uuid;
  v_entry_id uuid;
BEGIN
  PERFORM set_config('app.audit_written', 'on', true);

  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'FORBIDDEN: 본인만 매도 가능';
  END IF;

  IF p_quantity IS NULL OR p_quantity <= 0 THEN
    RAISE EXCEPTION 'INVALID_QUANTITY: 매도 수량은 0보다 커야 합니다.';
  END IF;

  SELECT COALESCE(SUM(CASE WHEN entry_type = 'ASSET_CREDIT' THEN quantity ELSE -quantity END), 0)
  INTO v_position
  FROM ledger_entries
  WHERE user_id = p_user_id AND asset_id = p_content_id;

  IF COALESCE(v_position, 0) < p_quantity THEN
    RAISE EXCEPTION 'INSUFFICIENT_ASSETS: 보유 수량이 부족합니다.';
  END IF;

  SELECT share_price_usd INTO v_share_price_usd
  FROM content_items WHERE id = p_content_id;
  v_share_price_usd := COALESCE(v_share_price_usd, 0);
  IF v_share_price_usd <= 0 THEN
    RAISE EXCEPTION 'PRICE_UNAVAILABLE: 해당 자산의 시세를 조회할 수 없습니다.';
  END IF;

  v_sell_amount_krw := ROUND(p_quantity * v_share_price_usd * v_fx_rate);

  SELECT id INTO v_product_id FROM products WHERE content_id = p_content_id LIMIT 1;

  IF p_idempotency_key IS NOT NULL AND TRIM(p_idempotency_key) <> '' THEN
    SELECT id INTO v_order_id FROM orders
    WHERE idempotency_key = TRIM(p_idempotency_key) AND user_id = p_user_id LIMIT 1;
    IF FOUND THEN
      RETURN jsonb_build_object('ok', true, 'order_id', v_order_id, 'idempotent', true);
    END IF;
  END IF;

  INSERT INTO orders (
    user_id, content_id, product_id, type, order_type, price, quantity, filled_quantity,
    status, completed_at, ledger_posted_at, total_amount_krw, idempotency_key
  ) VALUES (
    p_user_id, p_content_id, v_product_id, 'SELL', 'MARKET', v_share_price_usd * v_fx_rate, p_quantity, p_quantity,
    'COMPLETED', now(), now(), v_sell_amount_krw,
    CASE WHEN p_idempotency_key IS NOT NULL AND TRIM(p_idempotency_key) <> '' THEN TRIM(p_idempotency_key) ELSE NULL END
  )
  RETURNING id INTO v_order_id;

  IF v_order_id IS NULL THEN
    RAISE EXCEPTION 'ORDER_INSERT_FAILED';
  END IF;

  SELECT EXISTS(SELECT 1 FROM ledger_entries WHERE order_id = v_order_id AND entry_type = 'ASSET_DEBIT') INTO v_asset_exists;
  IF NOT v_asset_exists THEN
    INSERT INTO ledger_entries (user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata)
    VALUES (p_user_id, v_order_id, 'ASSET_DEBIT', 'KRW', 0, p_content_id, p_quantity, 'PRODUCT_SELL', '{}'::jsonb)
    RETURNING id INTO v_entry_id;
    PERFORM rpc_write_financial_audit('LEDGER_WRITE', 'LEDGER_ENTRY', v_entry_id::text, jsonb_build_object('entry_type', 'ASSET_DEBIT', 'amount', 0, 'currency', 'KRW', 'metadata', '{}'::jsonb));

    INSERT INTO ledger_entries (user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata)
    VALUES (p_user_id, v_order_id, 'CASH_CREDIT', 'KRW', v_sell_amount_krw, NULL, 0, 'PRODUCT_SELL', '{}'::jsonb)
    RETURNING id INTO v_entry_id;
    PERFORM rpc_write_financial_audit('LEDGER_WRITE', 'LEDGER_ENTRY', v_entry_id::text, jsonb_build_object('entry_type', 'CASH_CREDIT', 'amount', v_sell_amount_krw, 'currency', 'KRW', 'metadata', '{}'::jsonb));
  END IF;

  INSERT INTO notifications (user_id, type, reference_id, message)
  VALUES (p_user_id, 'INVEST_SUCCESS', p_content_id, format('₩%s 매도 완료', to_char(v_sell_amount_krw, 'FM999,999,999')));

  RETURN jsonb_build_object('ok', true, 'order_id', v_order_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_sell_content(uuid, uuid, numeric, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_sell_content(uuid, uuid, numeric, text) TO service_role;

-- ------------------------------------------------------------
-- 6) RPC 패치: rpc_execute_dividend
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.rpc_execute_dividend(
  p_dividend_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r record;
  v_total_shares numeric;
  v_dividend_per_share numeric;
  v_total_dividend numeric;
  v_item_id uuid;
  v_dist_id uuid;
  v_existing_count int;
  v_entry_id uuid;
BEGIN
  PERFORM set_config('app.audit_written', 'on', true);

  SELECT count(*)::int INTO v_existing_count
  FROM public.dividend_distributions WHERE dividend_id = p_dividend_id;

  IF v_existing_count > 0 THEN
    RETURN jsonb_build_object('ok', true, 'idempotent', true, 'distributed_count', v_existing_count);
  END IF;

  SELECT d.item_id, d.total_dividend_amount
  INTO v_item_id, v_total_dividend
  FROM public.dividends d
  WHERE d.id = p_dividend_id;

  IF v_item_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'DIVIDEND_NOT_FOUND');
  END IF;

  SELECT COALESCE(SUM(total_quantity),0)
  INTO v_total_shares
  FROM public.user_positions
  WHERE item_id = v_item_id;

  IF v_total_shares <= 0 THEN
    RETURN jsonb_build_object('ok', true, 'distributed_count', 0);
  END IF;

  v_dividend_per_share := v_total_dividend / v_total_shares;

  FOR r IN
    SELECT up.user_id, up.item_id, up.total_quantity
    FROM public.user_positions up
    WHERE up.item_id = v_item_id AND up.total_quantity > 0
  LOOP
    v_dist_id := NULL;
    INSERT INTO public.dividend_distributions (dividend_id, user_id, share_quantity, payout_amount)
    VALUES (p_dividend_id, r.user_id, r.total_quantity, ROUND(r.total_quantity * v_dividend_per_share, 0))
    ON CONFLICT (dividend_id, user_id) DO NOTHING
    RETURNING id INTO v_dist_id;

    IF v_dist_id IS NOT NULL THEN
      INSERT INTO public.ledger_entries (
        user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata
      )
      VALUES (
        r.user_id,
        gen_random_uuid(),
        'CASH_CREDIT',
        'KRW',
        ROUND(r.total_quantity * v_dividend_per_share, 0),
        NULL,
        0,
        'DIVIDEND',
        jsonb_build_object('dividend_id', p_dividend_id, 'item_id', v_item_id)
      )
      RETURNING id INTO v_entry_id;
      PERFORM rpc_write_financial_audit(
        'DIVIDEND_WRITE',
        'LEDGER_ENTRY',
        v_entry_id::text,
        jsonb_build_object('entry_type', 'CASH_CREDIT', 'amount', ROUND(r.total_quantity * v_dividend_per_share, 0), 'currency', 'KRW', 'metadata', jsonb_build_object('dividend_id', p_dividend_id, 'item_id', v_item_id))
      );
    END IF;
  END LOOP;

  RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_execute_dividend(uuid) TO service_role;

-- ------------------------------------------------------------
-- 7) RPC 패치: rpc_calculate_dividend (dividends INSERT)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.rpc_calculate_dividend(p_item_id uuid, p_total_revenue numeric, p_dividend_rate numeric)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_dividend numeric;
  v_dividend_id uuid;
BEGIN
  PERFORM set_config('app.audit_written', 'on', true);

  v_total_dividend := p_total_revenue * p_dividend_rate;
  INSERT INTO dividends (item_id, total_revenue, dividend_rate, total_dividend_amount)
  VALUES (p_item_id, p_total_revenue, p_dividend_rate, v_total_dividend)
  RETURNING id INTO v_dividend_id;

  PERFORM rpc_write_financial_audit(
    'DIVIDEND_WRITE',
    'DIVIDEND',
    v_dividend_id::text,
    jsonb_build_object('item_id', p_item_id, 'total_revenue', p_total_revenue, 'dividend_rate', p_dividend_rate, 'total_dividend', v_total_dividend)
  );

  RETURN jsonb_build_object('ok', true, 'dividend_id', v_dividend_id, 'total_dividend', v_total_dividend);
END;
$$;
GRANT EXECUTE ON FUNCTION public.rpc_calculate_dividend(uuid, numeric, numeric) TO service_role;

-- ------------------------------------------------------------
-- 8) RPC 패치: rpc_confirm_dividend (dividends UPDATE)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.rpc_confirm_dividend(p_dividend_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row record;
  v_total_shares numeric;
  v_recipient_count int;
  v_summary jsonb;
BEGIN
  PERFORM set_config('app.audit_written', 'on', true);

  SELECT * INTO v_row FROM dividends WHERE id = p_dividend_id;
  IF v_row IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'DIVIDEND_NOT_FOUND');
  END IF;

  IF COALESCE(v_row.status, 'DRAFT') = 'CONFIRMED' THEN
    RETURN jsonb_build_object('ok', true, 'idempotent', true);
  END IF;

  SELECT COALESCE(SUM(total_quantity), 0) INTO v_total_shares
  FROM user_positions WHERE item_id = v_row.item_id;

  SELECT count(*)::int INTO v_recipient_count
  FROM dividend_distributions WHERE dividend_id = p_dividend_id;

  v_summary := jsonb_build_object(
    'total_shares', v_total_shares,
    'recipient_count', v_recipient_count,
    'confirmed_at', now()
  );

  INSERT INTO positions_snapshot (user_id, item_id, quantity, avg_price)
  SELECT up.user_id, up.item_id, up.total_quantity, 0
  FROM user_positions up
  WHERE up.item_id = v_row.item_id AND up.total_quantity > 0;

  UPDATE dividends
  SET status = 'CONFIRMED', confirmed_at = now(), snapshot_json = v_summary
  WHERE id = p_dividend_id;

  PERFORM rpc_write_financial_audit('DIVIDEND_WRITE', 'DIVIDEND', p_dividend_id::text, jsonb_build_object('action', 'CONFIRM', 'metadata', v_summary));

  RETURN jsonb_build_object('ok', true);
END;
$$;
GRANT EXECUTE ON FUNCTION public.rpc_confirm_dividend(uuid) TO service_role;

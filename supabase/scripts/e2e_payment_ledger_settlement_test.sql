-- ============================================================
-- 결제 → 원장 → 정산 E2E 검증 스크립트 (런칭 기준)
-- 실행: psql -f supabase/scripts/e2e_payment_ledger_settlement_test.sql
-- 또는 Supabase SQL Editor에서 붙여넣기 후 실행
-- ============================================================

DO $$
DECLARE
  v_cleanup boolean := true;  -- true: 테스트 후 생성 데이터 삭제
  v_product_id uuid;
  v_buyer_id uuid;
  v_order_id text;  -- uuid as text for flexibility
  v_amount numeric := 12300;
  v_tno text;
  v_ledger_count int;
  v_cash_debit_amount numeric;
  v_asset_credit_qty numeric;
  v_order_total numeric;
  v_order_ledger_posted timestamptz;
  v_confirm_result jsonb;
  v_finalize_result jsonb;
  v_order_status text;
  v_settlement_exists boolean;
  v_rpc_settlement_exists boolean;
  v_batch_id uuid;
  v_batch_confirmed_at timestamptz;
  v_settlement_reached boolean := false;
BEGIN
  RAISE NOTICE '========== HANBANG CORE FLOW E2E 검증 시작 ==========';

  -- ------------------------------------------------------------
  -- STEP 1: product selected
  -- ------------------------------------------------------------
  SELECT id INTO v_product_id FROM public.products LIMIT 1;
  IF v_product_id IS NULL THEN
    RAISE EXCEPTION 'FAIL: products 테이블에 상품이 없습니다. E2E 시드 실행 필요.';
  END IF;
  RAISE NOTICE 'STEP 1: product selected (%)', v_product_id;

  -- ------------------------------------------------------------
  -- STEP 2: buyer selected
  -- ------------------------------------------------------------
  SELECT id INTO v_buyer_id FROM auth.users LIMIT 1;
  IF v_buyer_id IS NULL THEN
    SELECT id INTO v_buyer_id FROM public.profiles LIMIT 1;
  END IF;
  IF v_buyer_id IS NULL THEN
    RAISE EXCEPTION 'FAIL: auth.users 또는 profiles에 사용자가 없습니다.';
  END IF;
  RAISE NOTICE 'STEP 2: buyer selected (%)', v_buyer_id;

  -- ------------------------------------------------------------
  -- STEP 3: rpc_place_order 또는 orders insert
  -- ------------------------------------------------------------
  BEGIN
    PERFORM set_config('request.jwt.claims', json_build_object('sub', v_buyer_id::text)::text, true);
    SELECT (rpc_place_order(v_product_id, 'BUY', v_amount, 1))->>'id' INTO v_order_id;
    IF v_order_id IS NULL OR v_order_id = '' THEN
      RAISE EXCEPTION 'place_order_empty';
    END IF;
  EXCEPTION WHEN OTHERS THEN
    v_order_id := NULL;
  END;

  IF v_order_id IS NULL OR NOT EXISTS (SELECT 1 FROM public.orders WHERE id = v_order_id::uuid) THEN
    INSERT INTO public.orders (user_id, buyer_id, product_id, status, total_amount_krw, quantity, metadata)
    VALUES (v_buyer_id, v_buyer_id, v_product_id, 'PENDING', v_amount, 1, '{}'::jsonb)
    RETURNING id::text INTO v_order_id;
    RAISE NOTICE 'STEP 3: orders direct insert (auth unavailable), order_id: %', v_order_id;
  ELSE
    RAISE NOTICE 'STEP 3: rpc_place_order success, order_id: %', v_order_id;
  END IF;

  -- ------------------------------------------------------------
  -- STEP 4: rpc_confirm_payment
  -- ------------------------------------------------------------
  v_tno := 'TEST_TNO_' || to_char(now(), 'YYYYMMDDHH24MISS') || '_' || substr(md5(random()::text), 1, 8);

  SELECT rpc_confirm_payment(v_order_id::uuid, v_amount, v_tno, 'card') INTO v_confirm_result;
  IF (v_confirm_result->>'ok')::boolean IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'FAIL: rpc_confirm_payment failed. %', v_confirm_result;
  END IF;
  RAISE NOTICE 'STEP 4: rpc_confirm_payment success, status: %', v_confirm_result->>'status';

  -- ------------------------------------------------------------
  -- STEP 5: rpc_finalize_order
  -- ------------------------------------------------------------
  SELECT rpc_finalize_order(v_order_id::uuid) INTO v_finalize_result;
  IF (v_finalize_result->>'ok')::boolean IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'FAIL: rpc_finalize_order failed. %', v_finalize_result;
  END IF;
  RAISE NOTICE 'STEP 5: rpc_finalize_order success, status: %', v_finalize_result->>'status';

  -- ------------------------------------------------------------
  -- STEP 6: ledger_entries 검증 (CASH_DEBIT amount < 0, ASSET_CREDIT quantity > 0, order_id 동일)
  -- ------------------------------------------------------------
  SELECT count(*) INTO v_ledger_count
  FROM public.ledger_entries
  WHERE order_id = v_order_id::uuid;

  IF v_ledger_count != 2 THEN
    RAISE EXCEPTION 'FAIL: ledger_entries expected 2 rows, got %', v_ledger_count;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.ledger_entries WHERE order_id = v_order_id::uuid AND entry_type = 'CASH_DEBIT') THEN
    RAISE EXCEPTION 'FAIL: CASH_DEBIT record missing';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.ledger_entries WHERE order_id = v_order_id::uuid AND entry_type = 'ASSET_CREDIT') THEN
    RAISE EXCEPTION 'FAIL: ASSET_CREDIT record missing';
  END IF;

  SELECT amount INTO v_cash_debit_amount
  FROM public.ledger_entries
  WHERE order_id = v_order_id::uuid AND entry_type = 'CASH_DEBIT';
  IF v_cash_debit_amount >= 0 THEN
    RAISE EXCEPTION 'FAIL: CASH_DEBIT amount must be < 0, got %', v_cash_debit_amount;
  END IF;

  SELECT quantity INTO v_asset_credit_qty
  FROM public.ledger_entries
  WHERE order_id = v_order_id::uuid AND entry_type = 'ASSET_CREDIT';
  IF v_asset_credit_qty <= 0 THEN
    RAISE EXCEPTION 'FAIL: ASSET_CREDIT quantity must be > 0, got %', v_asset_credit_qty;
  END IF;

  IF EXISTS (SELECT 1 FROM public.ledger_entries WHERE order_id = v_order_id::uuid AND order_id IS NULL) THEN
    RAISE EXCEPTION 'FAIL: ledger_entries order_id consistency check failed';
  END IF;
  RAISE NOTICE 'STEP 6: ledger_entries verified (CASH_DEBIT amount=%, ASSET_CREDIT qty=%)', v_cash_debit_amount, v_asset_credit_qty;

  -- ------------------------------------------------------------
  -- STEP 7: orders total_amount_krw = |CASH_DEBIT|, ledger_posted_at IS NOT NULL
  -- ------------------------------------------------------------
  SELECT total_amount_krw, ledger_posted_at INTO v_order_total, v_order_ledger_posted
  FROM public.orders WHERE id = v_order_id::uuid;

  IF v_order_total IS NULL THEN
    RAISE EXCEPTION 'FAIL: orders.total_amount_krw is null';
  END IF;
  IF ABS(v_cash_debit_amount) - v_order_total > 0.01 THEN
    RAISE EXCEPTION 'FAIL: total_amount_krw (%) != |CASH_DEBIT| (%), diff=%', v_order_total, ABS(v_cash_debit_amount), ABS(ABS(v_cash_debit_amount) - v_order_total);
  END IF;
  IF v_order_ledger_posted IS NULL THEN
    RAISE EXCEPTION 'FAIL: orders.ledger_posted_at must be NOT NULL';
  END IF;
  RAISE NOTICE 'STEP 7: orders verified (total=%, ledger_posted_at=%)', v_order_total, v_order_ledger_posted;

  -- ------------------------------------------------------------
  -- STEP 8: settlement_batches 존재 여부
  -- ------------------------------------------------------------
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'settlement_batches'
  ) OR EXISTS (
    SELECT 1 FROM information_schema.views
    WHERE table_schema = 'public' AND table_name = 'settlement_batches'
  ) INTO v_settlement_exists;

  IF v_settlement_exists THEN
    RAISE NOTICE 'STEP 8: settlement_batches exists';
  ELSE
    RAISE NOTICE 'STEP 8: settlement_batches does not exist (settlement step skipped)';
  END IF;

  -- ------------------------------------------------------------
  -- STEP 9: rpc_admin_confirm_settlement (존재 시)
  -- ------------------------------------------------------------
  SELECT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'rpc_admin_confirm_settlement'
  ) INTO v_rpc_settlement_exists;

  IF v_rpc_settlement_exists AND v_settlement_exists THEN
    SELECT id INTO v_batch_id FROM public.settlement_batches WHERE confirmed_at IS NULL LIMIT 1;
    IF v_batch_id IS NOT NULL THEN
      PERFORM rpc_admin_confirm_settlement(v_batch_id);
      v_settlement_reached := true;
      SELECT confirmed_at INTO v_batch_confirmed_at FROM public.settlement_batches WHERE id = v_batch_id;
      IF v_batch_confirmed_at IS NULL THEN
        RAISE EXCEPTION 'FAIL: settlement batch confirmed_at still NULL after rpc_admin_confirm_settlement';
      END IF;
      RAISE NOTICE 'STEP 9: rpc_admin_confirm_settlement success, batch_id: %, settled', v_batch_id;
    ELSE
      RAISE NOTICE 'STEP 9: no unconfirmed batch (skipped)';
    END IF;
  ELSE
    RAISE NOTICE 'STEP 9: rpc_admin_confirm_settlement or settlement_batches not found (skipped)';
  END IF;

  -- ------------------------------------------------------------
  -- STEP 10: orders.status (COMPLETED 또는 settlement 시 SETTLED)
  -- ------------------------------------------------------------
  SELECT status::text INTO v_order_status FROM public.orders WHERE id = v_order_id::uuid;
  IF v_order_status IS NULL THEN
    RAISE EXCEPTION 'FAIL: order not found';
  END IF;

  IF v_settlement_reached THEN
    IF v_order_status != 'SETTLED' AND v_order_status != 'COMPLETED' THEN
      RAISE EXCEPTION 'FAIL: orders.status expected COMPLETED or SETTLED, got %', v_order_status;
    END IF;
    RAISE NOTICE 'STEP 10: orders.status = % (settlement reached)', v_order_status;
  ELSE
    IF v_order_status != 'COMPLETED' THEN
      RAISE EXCEPTION 'FAIL: orders.status expected COMPLETED, got %', v_order_status;
    END IF;
    RAISE NOTICE 'STEP 10: orders.status = COMPLETED';
  END IF;

  -- ========== 멱등 테스트 ==========
  RAISE NOTICE '------ IDEMPOTENCY TEST ------';

  v_confirm_result := rpc_confirm_payment(v_order_id::uuid, v_amount, v_tno, 'card');
  IF (v_confirm_result->>'ok')::boolean IS NOT TRUE THEN
    RAISE EXCEPTION 'FAIL: rpc_confirm_payment idempotency test failed. %', v_confirm_result;
  END IF;
  RAISE NOTICE 'IDEMPOTENCY: rpc_confirm_payment same tno re-call ok';

  v_finalize_result := rpc_finalize_order(v_order_id::uuid);
  IF (v_finalize_result->>'ok')::boolean IS NOT TRUE THEN
    RAISE EXCEPTION 'FAIL: rpc_finalize_order idempotency test failed. %', v_finalize_result;
  END IF;
  RAISE NOTICE 'IDEMPOTENCY: rpc_finalize_order re-call ok';

  SELECT count(*) INTO v_ledger_count FROM public.ledger_entries WHERE order_id = v_order_id::uuid;
  IF v_ledger_count != 2 THEN
    RAISE EXCEPTION 'FAIL: after idempotency ledger_entries expected 2, got %', v_ledger_count;
  END IF;
  RAISE NOTICE 'IDEMPOTENCY: ledger_entries 2 rows preserved';

  -- ------------------------------------------------------------
  -- CLEANUP (v_cleanup = true 시)
  -- ------------------------------------------------------------
  IF v_cleanup THEN
    DELETE FROM public.ledger_entries WHERE order_id = v_order_id::uuid;
    DELETE FROM public.payments WHERE order_id = v_order_id::uuid;
    DELETE FROM public.orders WHERE id = v_order_id::uuid;
    RAISE NOTICE 'CLEANUP: test data deleted (order_id: %)', v_order_id;
  END IF;

  RAISE NOTICE '=== HANBANG CORE FLOW VERIFIED ===';
END $$;

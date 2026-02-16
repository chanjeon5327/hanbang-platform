-- orders 소유자/구매자 컬럼 user_id 기준 통일
-- 1) user_id 컬럼 보장 및 buyer_id 이관
-- 2) RPC/RLS/뷰 검증 로직 user_id 기준 통일 (COALESCE로 buyer_id 호환)

BEGIN;

-- ------------------------------------------------------------
-- 1) user_id 컬럼 추가 및 backfill
-- ------------------------------------------------------------
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

UPDATE public.orders SET user_id = buyer_id WHERE user_id IS NULL AND buyer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders (user_id);

-- ------------------------------------------------------------
-- 2) rpc_finalize_order: 소유자 COALESCE(user_id, buyer_id)
-- ------------------------------------------------------------
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
BEGIN
  PERFORM set_config('app.allow_settlement', 'on', true);

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
  VALUES (v_user, p_order_id, 'CASH_DEBIT', 'KRW', (v_cash * -1), null, 0, 'Order completed: cash debit', '{}'::jsonb);
  INSERT INTO ledger_entries (user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata)
  VALUES (v_user, p_order_id, 'ASSET_CREDIT', 'KRW', 0, v_asset, v_qty, 'Order completed: asset credit', '{}'::jsonb);

  UPDATE orders SET status = 'COMPLETED', completed_at = coalesce(completed_at, now()), ledger_posted_at = now() WHERE id = p_order_id;
  RETURN jsonb_build_object('ok', true);
END;
$$;

-- ------------------------------------------------------------
-- 3) rpc_place_order: user_id 사용 (buyer_id 대체)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.rpc_place_order(
  p_product_id uuid,
  p_side text DEFAULT 'BUY',
  p_price numeric DEFAULT 0,
  p_quantity numeric DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_order_id uuid;
  v_total numeric;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Unauthorized: 로그인이 필요합니다.'; END IF;
  IF p_quantity IS NULL OR p_quantity <= 0 THEN RAISE EXCEPTION '수량은 1 이상이어야 합니다.'; END IF;
  IF p_price IS NULL OR p_price < 0 THEN RAISE EXCEPTION '가격이 올바르지 않습니다.'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.products WHERE id = p_product_id) THEN RAISE EXCEPTION '존재하지 않는 상품입니다.'; END IF;
  IF p_side IS DISTINCT FROM 'BUY' THEN RAISE EXCEPTION '현재 매수만 지원합니다.'; END IF;

  v_total := p_price * p_quantity;

  INSERT INTO public.orders (user_id, product_id, status, total_amount_krw, quantity, metadata)
  VALUES (v_user_id, p_product_id, 'created', v_total, p_quantity, jsonb_build_object('side', p_side, 'price_per_unit', p_price))
  RETURNING id INTO v_order_id;

  RETURN jsonb_build_object('id', v_order_id, 'status', 'created', 'total_amount_krw', v_total, 'quantity', p_quantity);
END;
$$;

-- buyer_id 동기화 (user_id 우선, buyer_id NOT NULL 호환)
CREATE OR REPLACE FUNCTION public.tg_orders_sync_buyer_id()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.user_id IS NOT NULL THEN
    NEW.buyer_id := NEW.user_id;
  ELSIF NEW.buyer_id IS NOT NULL THEN
    NEW.user_id := NEW.buyer_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_orders_sync_buyer_id ON public.orders;
CREATE TRIGGER trg_orders_sync_buyer_id
  BEFORE INSERT OR UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.tg_orders_sync_buyer_id();

-- ------------------------------------------------------------
-- 4) RLS: buyer can view own orders → user_id 기준
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "buyer can view own orders" ON public.orders;
CREATE POLICY "buyer can view own orders"
  ON public.orders FOR SELECT
  USING (COALESCE(user_id, buyer_id) = auth.uid());

-- ------------------------------------------------------------
-- 5) 뷰: orders_with_seller, admin_orders_full → user_id 기준
-- ------------------------------------------------------------
DROP VIEW IF EXISTS public.orders_with_seller;
CREATE OR REPLACE VIEW public.orders_with_seller AS
SELECT
  o.id AS order_id,
  COALESCE(o.user_id, o.buyer_id) AS buyer_id,
  p.seller_id,
  o.product_id,
  COALESCE(o.total_amount_krw, o.amount, 0) AS amount,
  o.status,
  o.created_at
FROM orders o
JOIN products p ON p.id = o.product_id;

DROP VIEW IF EXISTS public.admin_orders_full;
CREATE OR REPLACE VIEW public.admin_orders_full AS
SELECT
  o.id AS order_id,
  o.created_at,
  o.status,
  COALESCE(o.total_amount_krw, o.amount, 0) AS amount,
  COALESCE(o.user_id, o.buyer_id) AS buyer_id,
  bu.email AS buyer_email,
  p.id AS product_id,
  p.title AS product_title,
  p.seller_id,
  su.email AS seller_email
FROM orders o
JOIN products p ON p.id = o.product_id
JOIN auth.users bu ON bu.id = COALESCE(o.user_id, o.buyer_id)
JOIN auth.users su ON su.id = p.seller_id;

COMMIT;

-- ledger_entries INSERT 전용 RPC (place route 등에서 사용)
-- SECURITY DEFINER로 service_role 없이 호출 가능

CREATE OR REPLACE FUNCTION public.rpc_post_ledger_for_order(
  p_order_id uuid,
  p_user_id uuid,
  p_amount_krw numeric,
  p_product_id uuid DEFAULT NULL,
  p_quantity numeric DEFAULT 1
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'FORBIDDEN: 본인 주문만 원장 반영 가능';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM orders o
    WHERE o.id = p_order_id AND COALESCE(o.user_id, o.buyer_id) = p_user_id
  ) THEN
    RAISE EXCEPTION 'ORDER_NOT_FOUND_OR_FORBIDDEN';
  END IF;

  IF EXISTS (SELECT 1 FROM ledger_entries WHERE order_id = p_order_id AND entry_type = 'CASH_DEBIT') THEN
    RETURN jsonb_build_object('ok', true, 'idempotent', true);
  END IF;

  INSERT INTO ledger_entries (user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata)
  VALUES (p_user_id, p_order_id, 'CASH_DEBIT', 'KRW', (p_amount_krw * -1), NULL, 0, 'PRODUCT_PURCHASE', '{}'::jsonb);

  IF p_product_id IS NOT NULL AND p_quantity > 0 THEN
    INSERT INTO ledger_entries (user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata)
    VALUES (p_user_id, p_order_id, 'ASSET_CREDIT', 'KRW', 0, p_product_id, p_quantity, 'PRODUCT_PURCHASE', '{}'::jsonb);
  END IF;

  RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_post_ledger_for_order(uuid, uuid, numeric, uuid, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_post_ledger_for_order(uuid, uuid, numeric, uuid, numeric) TO service_role;

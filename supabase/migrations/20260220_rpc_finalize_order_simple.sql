-- rpc_finalize_order (단순 버전: order_id만, FOR UPDATE, 멱등 체크)
CREATE OR REPLACE FUNCTION public.rpc_finalize_order(
  p_order_id uuid
)
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
  SELECT * INTO v_order
  FROM orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'ORDER_NOT_FOUND';
  END IF;

  IF v_order.status <> 'PAID' THEN
    RAISE EXCEPTION 'ORDER_NOT_PAID';
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM ledger_entries
    WHERE order_id = p_order_id
    AND entry_type = 'CASH_DEBIT'
  ) INTO v_cash_exists;

  SELECT EXISTS(
    SELECT 1 FROM ledger_entries
    WHERE order_id = p_order_id
    AND entry_type = 'ASSET_CREDIT'
  ) INTO v_asset_exists;

  IF v_cash_exists OR v_asset_exists THEN
    RAISE EXCEPTION 'LEDGER_ALREADY_POSTED';
  END IF;

  v_user := v_order.buyer_id;
  v_cash := coalesce(v_order.total_amount_krw, 0);
  v_qty := coalesce(v_order.quantity, 0);
  v_asset := coalesce(v_order.product_id, (v_order.metadata->>'asset_id')::uuid);

  INSERT INTO ledger_entries (user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata)
  VALUES (v_user, p_order_id, 'CASH_DEBIT', 'KRW', (v_cash * -1), null, 0, 'Order completed: cash debit', '{}'::jsonb);

  INSERT INTO ledger_entries (user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata)
  VALUES (v_user, p_order_id, 'ASSET_CREDIT', 'KRW', 0, v_asset, v_qty, 'Order completed: asset credit', '{}'::jsonb);

  UPDATE orders
  SET
    status = 'COMPLETED',
    completed_at = coalesce(completed_at, now()),
    ledger_posted_at = now()
  WHERE id = p_order_id;

  RETURN jsonb_build_object('ok', true);
END;
$$;

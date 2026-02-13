-- rpc_confirm_payment (단순 버전: order_id + pg_transaction_id)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS pg_transaction_id text;

CREATE OR REPLACE FUNCTION public.rpc_confirm_payment(
  p_order_id uuid,
  p_pg_transaction_id text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order record;
BEGIN
  SELECT * INTO v_order
  FROM orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'ORDER_NOT_FOUND';
  END IF;

  IF v_order.status <> 'PENDING' THEN
    RAISE EXCEPTION 'INVALID_STATUS_TRANSITION';
  END IF;

  UPDATE orders
  SET
    status = 'PAID',
    pg_transaction_id = p_pg_transaction_id,
    paid_at = now()
  WHERE id = p_order_id;

  RETURN jsonb_build_object('ok', true);
END;
$$;

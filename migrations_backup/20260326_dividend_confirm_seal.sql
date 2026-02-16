ALTER TABLE public.dividends ADD COLUMN IF NOT EXISTS status text DEFAULT 'DRAFT';
ALTER TABLE public.dividends ADD COLUMN IF NOT EXISTS confirmed_at timestamptz;

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

  RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_confirm_dividend(uuid) TO service_role;

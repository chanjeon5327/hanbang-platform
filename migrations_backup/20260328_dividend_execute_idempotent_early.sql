-- rpc_execute_dividend: 이미 distributions 존재 시 즉시 return (멱등성 강화)
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
BEGIN
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
        user_id,
        order_id,
        entry_type,
        currency,
        amount,
        asset_id,
        quantity,
        memo,
        metadata
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
      );
    END IF;
  END LOOP;

  RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_execute_dividend(uuid) TO service_role;

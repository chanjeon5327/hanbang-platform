-- HANBANG Dividend Engine: dividends, dividend_distributions, positions_snapshot, user_positions, RPCs

-- 1-1) dividends (item_id = content_items.id)
CREATE TABLE IF NOT EXISTS public.dividends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.content_items(id) ON DELETE RESTRICT,
  total_revenue numeric NOT NULL,
  dividend_rate numeric NOT NULL,
  total_dividend_amount numeric NOT NULL,
  snapshot_json jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS dividends_item_id_idx ON public.dividends (item_id);

-- 1-2) dividend_distributions
CREATE TABLE IF NOT EXISTS public.dividend_distributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dividend_id uuid NOT NULL REFERENCES public.dividends(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  share_quantity numeric NOT NULL,
  payout_amount numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS dividend_distributions_user_id_idx ON public.dividend_distributions (user_id);
CREATE INDEX IF NOT EXISTS dividend_distributions_dividend_id_idx ON public.dividend_distributions (dividend_id);

-- 1-3) positions_snapshot
CREATE TABLE IF NOT EXISTS public.positions_snapshot (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  item_id uuid NOT NULL,
  quantity numeric NOT NULL,
  avg_price numeric NOT NULL,
  snapshot_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS positions_snapshot_user_item_idx ON public.positions_snapshot (user_id, item_id);

-- RLS
ALTER TABLE public.dividends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dividend_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions_snapshot ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dividends_select_all" ON public.dividends FOR SELECT USING (true);
CREATE POLICY "dividend_distributions_select_own" ON public.dividend_distributions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "positions_snapshot_select_own" ON public.positions_snapshot FOR SELECT USING (auth.uid() = user_id);

-- 2) user_positions view (ledger_entries 기반, trade_executions 없음)
CREATE OR REPLACE VIEW public.user_positions AS
SELECT
  user_id,
  asset_id AS item_id,
  COALESCE(SUM(
    CASE
      WHEN entry_type = 'ASSET_CREDIT' THEN quantity
      WHEN entry_type = 'ASSET_DEBIT' THEN -quantity
      ELSE 0
    END
  ), 0) AS total_quantity
FROM public.ledger_entries
WHERE asset_id IS NOT NULL
GROUP BY user_id, asset_id
HAVING COALESCE(SUM(
  CASE
    WHEN entry_type = 'ASSET_CREDIT' THEN quantity
    WHEN entry_type = 'ASSET_DEBIT' THEN -quantity
    ELSE 0
  END
), 0) > 0;

-- 3) rpc_calculate_dividend
CREATE OR REPLACE FUNCTION public.rpc_calculate_dividend(
  p_item_id uuid,
  p_total_revenue numeric,
  p_dividend_rate numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_dividend numeric;
  v_dividend_id uuid;
BEGIN
  v_total_dividend := p_total_revenue * p_dividend_rate;

  INSERT INTO dividends (
    item_id,
    total_revenue,
    dividend_rate,
    total_dividend_amount
  )
  VALUES (
    p_item_id,
    p_total_revenue,
    p_dividend_rate,
    v_total_dividend
  )
  RETURNING id INTO v_dividend_id;

  RETURN jsonb_build_object(
    'ok', true,
    'dividend_id', v_dividend_id,
    'total_dividend', v_total_dividend
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_calculate_dividend(uuid, numeric, numeric) TO service_role;

-- 4) rpc_execute_dividend (원장 반영)
CREATE OR REPLACE FUNCTION public.rpc_execute_dividend(
  p_dividend_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r RECORD;
  v_total_shares numeric;
  v_dividend_per_share numeric;
  v_total_dividend numeric;
  v_item_id uuid;
BEGIN
  SELECT d.item_id, d.total_dividend_amount
  INTO v_item_id, v_total_dividend
  FROM dividends d
  WHERE d.id = p_dividend_id;

  IF v_item_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'DIVIDEND_NOT_FOUND');
  END IF;

  SELECT COALESCE(SUM(total_quantity), 0) INTO v_total_shares
  FROM user_positions
  WHERE item_id = v_item_id;

  IF v_total_shares <= 0 THEN
    RETURN jsonb_build_object('ok', true, 'distributed_count', 0);
  END IF;

  v_dividend_per_share := v_total_dividend / v_total_shares;

  FOR r IN
    SELECT up.user_id, up.item_id, up.total_quantity
    FROM user_positions up
    WHERE up.item_id = v_item_id AND up.total_quantity > 0
  LOOP
    INSERT INTO dividend_distributions (dividend_id, user_id, share_quantity, payout_amount)
    VALUES (p_dividend_id, r.user_id, r.total_quantity, ROUND(r.total_quantity * v_dividend_per_share, 0));

    INSERT INTO ledger_entries (
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
      NULL,
      'CASH_CREDIT',
      'KRW',
      ROUND(r.total_quantity * v_dividend_per_share, 0),
      NULL,
      0,
      'DIVIDEND',
      jsonb_build_object('dividend_id', p_dividend_id, 'item_id', v_item_id)
    );
  END LOOP;

  RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_execute_dividend(uuid) TO service_role;

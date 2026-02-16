-- DAY 2: Portfolio Return System
-- 현재가: 최근 trades 가격, portfolio_return_view, rpc_calculate_irr

-- 1) 현재가 뷰 (item별 최근 체결가)
CREATE OR REPLACE VIEW public.v_item_last_price AS
SELECT DISTINCT ON (content_id) content_id AS item_id, price_usd, COALESCE(price_krw, ROUND(price_usd * 1350, 0)) AS price_krw, created_at
FROM public.trades
WHERE content_id IS NOT NULL
ORDER BY content_id, created_at DESC;

-- 2) portfolio_return_view
CREATE OR REPLACE VIEW public.portfolio_return_view AS
WITH pos AS (
  SELECT user_id, asset_id AS item_id,
    COALESCE(SUM(CASE WHEN entry_type = 'ASSET_CREDIT' THEN quantity WHEN entry_type = 'ASSET_DEBIT' THEN -quantity ELSE 0 END), 0) AS quantity
  FROM ledger_entries WHERE asset_id IS NOT NULL
  GROUP BY user_id, asset_id
  HAVING COALESCE(SUM(CASE WHEN entry_type = 'ASSET_CREDIT' THEN quantity WHEN entry_type = 'ASSET_DEBIT' THEN -quantity ELSE 0 END), 0) > 0
),
costs AS (
  SELECT ae.user_id, ae.asset_id AS item_id, ABS(cd.amount) AS cost
  FROM ledger_entries ae
  JOIN ledger_entries cd ON cd.user_id = ae.user_id AND cd.order_id = ae.order_id AND cd.entry_type = 'CASH_DEBIT'
  WHERE ae.entry_type = 'ASSET_CREDIT' AND ae.asset_id IS NOT NULL
),
avg_cost AS (
  SELECT user_id, item_id, SUM(cost) AS total_cost
  FROM costs GROUP BY user_id, item_id
),
div_total AS (
  SELECT user_id, SUM(amount) AS total_dividend
  FROM ledger_entries
  WHERE entry_type = 'CASH_CREDIT' AND memo = 'DIVIDEND'
  GROUP BY user_id
)
SELECT p.user_id, p.item_id, p.quantity,
  ac.total_cost AS avg_cost,
  COALESCE(lp.price_krw, ci.share_price_usd * 1350) AS current_price,
  p.quantity * COALESCE(lp.price_krw, ci.share_price_usd * 1350) AS current_value,
  (p.quantity * COALESCE(lp.price_krw, ci.share_price_usd * 1350)) - ac.total_cost AS unrealized_pnl,
  CASE WHEN ac.total_cost > 0 THEN ((p.quantity * COALESCE(lp.price_krw, ci.share_price_usd * 1350)) - ac.total_cost) / ac.total_cost * 100 ELSE 0 END AS return_rate,
  COALESCE(d.total_dividend, 0) AS total_dividend
FROM pos p
LEFT JOIN avg_cost ac ON ac.user_id = p.user_id AND ac.item_id = p.item_id
LEFT JOIN v_item_last_price lp ON lp.item_id = p.item_id
LEFT JOIN content_items ci ON ci.id = p.item_id
LEFT JOIN div_total d ON d.user_id = p.user_id;

-- 3) rpc_calculate_irr (간이 버전: 총투자대비 수익률)
CREATE OR REPLACE FUNCTION public.rpc_calculate_irr(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_invested numeric := 0;
  v_current_value numeric := 0;
  v_total_dividend numeric := 0;
  v_irr numeric;
BEGIN
  SELECT COALESCE(SUM(avg_cost), 0), COALESCE(SUM(current_value), 0)
  INTO v_total_invested, v_current_value
  FROM portfolio_return_view WHERE user_id = p_user_id;

  v_total_dividend := (SELECT COALESCE(SUM(amount), 0) FROM ledger_entries WHERE user_id = p_user_id AND entry_type = 'CASH_CREDIT' AND memo = 'DIVIDEND');

  IF v_total_invested <= 0 THEN
    RETURN jsonb_build_object('ok', true, 'irr', 0, 'total_invested', 0, 'current_value', v_current_value, 'total_dividend', v_total_dividend);
  END IF;

  v_irr := ((v_current_value + v_total_dividend - v_total_invested) / v_total_invested) * 100;

  RETURN jsonb_build_object('ok', true, 'irr', ROUND(v_irr::numeric, 2), 'total_invested', v_total_invested, 'current_value', v_current_value, 'total_dividend', v_total_dividend);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_calculate_irr(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.rpc_calculate_irr(uuid) TO authenticated;

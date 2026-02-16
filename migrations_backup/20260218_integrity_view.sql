-- 데이터 정합성 점검 VIEW
-- orders_sum vs ledger_sum vs current_raise 비교

CREATE OR REPLACE VIEW public.v_integrity_check AS
SELECT
  o.content_id,
  SUM(o.total_amount_krw) AS orders_sum,
  COALESCE(leg.ledger_sum, 0) AS ledger_sum,
  ci.current_raise
FROM public.orders o
LEFT JOIN public.content_items ci ON ci.id = o.content_id
LEFT JOIN (
  SELECT asset_id, SUM(amount) AS ledger_sum
  FROM public.ledger_entries
  WHERE entry_type = 'ASSET_CREDIT'
  GROUP BY asset_id
) leg ON leg.asset_id = o.content_id
WHERE o.status IN ('INVEST_CONFIRMED', 'SETTLED', 'COMPLETED')
  AND o.content_id IS NOT NULL
GROUP BY o.content_id, ci.current_raise, leg.ledger_sum;

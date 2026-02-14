-- 최근 투자 집계 VIEW

CREATE OR REPLACE VIEW public.v_recent_invest_stats AS
SELECT
  content_id,
  COUNT(*) FILTER (WHERE created_at > now() - interval '1 hour') AS last_1h_count,
  COUNT(*) FILTER (WHERE created_at > now() - interval '24 hours') AS last_24h_count,
  SUM(total_amount_krw) FILTER (WHERE created_at > now() - interval '24 hours') AS last_24h_amount
FROM public.orders
WHERE status IN ('INVEST_CONFIRMED', 'SETTLED', 'COMPLETED')
  AND content_id IS NOT NULL
GROUP BY content_id;

GRANT SELECT ON public.v_recent_invest_stats TO authenticated;
GRANT SELECT ON public.v_recent_invest_stats TO anon;

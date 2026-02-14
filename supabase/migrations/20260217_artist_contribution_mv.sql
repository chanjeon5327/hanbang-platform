-- 사용자 아티스트 기여 MV (INVEST_CONFIRMED/COMPLETED 기준)
-- rpc_invest_limits_and_guard의 REFRESH보다 먼저 생성되어야 함

CREATE MATERIALIZED VIEW IF NOT EXISTS public.user_artist_contribution AS
SELECT
  o.user_id,
  c.artist_keyword,
  SUM(COALESCE(o.total_amount_krw, 0))::bigint AS total_amount
FROM public.orders o
JOIN public.content_items c ON o.content_id = c.id
WHERE o.status IN ('INVEST_CONFIRMED', 'COMPLETED')
  AND c.artist_keyword IS NOT NULL
GROUP BY o.user_id, c.artist_keyword;

-- CONCURRENTLY refresh를 위해 UNIQUE 인덱스 필요
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_artist_contribution_user_artist
ON public.user_artist_contribution (user_id, artist_keyword);

GRANT SELECT ON public.user_artist_contribution TO authenticated;

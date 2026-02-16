-- 추천 2차 MV: 인기 + 최근 투자 + D-Day 모멘텀

CREATE MATERIALIZED VIEW IF NOT EXISTS public.recommendation_score_mv AS
SELECT
  ci.id,
  (
    COALESCE(pop.cnt, 0) * 0.5
    + COALESCE(r.last_24h_count, 0)::numeric * 0.3
    + CASE
        WHEN ci.event_date IS NOT NULL AND ci.event_date >= now()
        THEN GREATEST(0, 14 - EXTRACT(DAY FROM (ci.event_date - now()))::int)
        ELSE 0
      END * 0.2
  ) AS score
FROM public.content_items ci
LEFT JOIN public.popular_content_mv pop ON pop.content_id = ci.id
LEFT JOIN public.v_recent_invest_stats r ON r.content_id = ci.id
WHERE ci.status = 'active';

CREATE UNIQUE INDEX IF NOT EXISTS idx_recommendation_score_id
ON public.recommendation_score_mv (id);

CREATE INDEX IF NOT EXISTS idx_recommendation_score
ON public.recommendation_score_mv (score DESC);

GRANT SELECT ON public.recommendation_score_mv TO authenticated;
GRANT SELECT ON public.recommendation_score_mv TO anon;

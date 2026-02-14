-- 공식 파트너십 도달률 VIEW (user_artist_contribution MV 기반)

CREATE OR REPLACE VIEW public.user_artist_progress AS
SELECT
  uac.user_id,
  uac.artist_keyword,
  uac.total_amount,
  COALESCE(at.target_amount, 100000000)::bigint AS target_amount,
  ROUND(
    (uac.total_amount::numeric /
     NULLIF(COALESCE(at.target_amount, 100000000)::numeric, 0)) * 100
  )::int AS progress_percent
FROM public.user_artist_contribution uac
LEFT JOIN public.artist_targets at
  ON at.artist_keyword = uac.artist_keyword;

GRANT SELECT ON public.user_artist_progress TO authenticated;

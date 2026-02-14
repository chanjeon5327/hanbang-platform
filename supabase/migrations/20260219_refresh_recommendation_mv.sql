-- recommendation_score_mv 자동 갱신 함수

CREATE OR REPLACE FUNCTION public.refresh_recommendation_mv()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY recommendation_score_mv;
EXCEPTION
  WHEN OTHERS THEN
    -- MV가 없거나 인덱스 문제 시 무시 (초기 배포 시)
    NULL;
END;
$$;

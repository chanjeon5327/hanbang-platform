-- 인기 API: user_interests 집계 (전건 조회 제거, Postgres group by 사용)
-- popular/route.ts에서 호출
CREATE OR REPLACE FUNCTION public.get_popular_content_ids(p_limit int DEFAULT 50)
RETURNS TABLE(content_id uuid, cnt bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ui.content_id, count(*)::bigint
  FROM user_interests ui
  GROUP BY ui.content_id
  ORDER BY count(*) DESC
  LIMIT greatest(1, least(p_limit, 50));
$$;

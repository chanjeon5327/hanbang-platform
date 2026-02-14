-- 인기 집계 MV
create materialized view if not exists popular_content_mv as
select content_id, count(*) as cnt
from public.user_interests
group by content_id;

create unique index if not exists idx_popular_content_mv_content_id
on popular_content_mv (content_id);

-- cnt desc 정렬용 index (인기순 조회)
create index if not exists idx_popular_content_mv_cnt_desc
on popular_content_mv (cnt desc);

-- 5분마다 갱신용 함수
create or replace function refresh_popular_content_mv()
returns void
language plpgsql
security definer
as $$
begin
  refresh materialized view concurrently popular_content_mv;
end;
$$;

-- cron으로 자동 refresh (pg_cron 확장 필요 시 아래 주석 해제)
-- select cron.schedule('refresh_popular_mv', '*/5 * * * *', 'select refresh_popular_content_mv()');

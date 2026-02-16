create or replace function rpc_increment_content_metric(
  p_content_id uuid,
  p_day date,
  p_impressions bigint,
  p_clicks bigint,
  p_interests bigint,
  p_watch_seconds bigint
)
returns void
language plpgsql
as $$
begin
  insert into content_metrics_daily (
    content_id,
    day,
    impressions,
    clicks,
    interests,
    watch_seconds
  )
  values (
    p_content_id,
    p_day,
    p_impressions,
    p_clicks,
    p_interests,
    p_watch_seconds
  )
  on conflict (content_id, day)
  do update set
    impressions = content_metrics_daily.impressions + excluded.impressions,
    clicks = content_metrics_daily.clicks + excluded.clicks,
    interests = content_metrics_daily.interests + excluded.interests,
    watch_seconds = content_metrics_daily.watch_seconds + excluded.watch_seconds,
    updated_at = now();
end;
$$;

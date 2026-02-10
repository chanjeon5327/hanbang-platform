create or replace function rpc_close_experiment_rail(
  p_min_impressions bigint default 300,
  p_min_score numeric default 6,
  p_now timestamptz default now()
)
returns jsonb
language plpgsql
security definer
as $$
declare
  r record;
  v_demoted integer := 0;
begin
  -- 실험 레일 대상 순회
  for r in
    select
      rm.content_id,
      rm.score,
      m.impressions_7d,
      m.clicks_7d,
      m.interests_7d,
      m.watch_seconds_7d
    from rail_memberships rm
    join v_content_metrics_7d m
      on m.content_id = rm.content_id
    where rm.rail_key = 'experiment'
      and (rm.expires_at is null or rm.expires_at <= p_now)
  loop
    -- 종료 조건: 충분한 노출 + 낮은 스코어
    if r.impressions_7d >= p_min_impressions
       and r.score < p_min_score then

      -- 1) 실험 레일에서 제거
      delete from rail_memberships
      where rail_key = 'experiment'
        and content_id = r.content_id;

      -- 2) 무소음 로그
      insert into rail_experiment_logs (
        content_id,
        action,
        from_rail,
        to_rail,
        score,
        detail
      ) values (
        r.content_id,
        'DEMOTE',
        'experiment',
        'none',
        r.score,
        jsonb_build_object(
          'impressions_7d', r.impressions_7d,
          'clicks_7d', r.clicks_7d,
          'interests_7d', r.interests_7d,
          'watch_seconds_7d', r.watch_seconds_7d
        )
      );

      v_demoted := v_demoted + 1;
    end if;
  end loop;

  return jsonb_build_object(
    'status', 'ok',
    'demoted', v_demoted
  );
end;
$$;

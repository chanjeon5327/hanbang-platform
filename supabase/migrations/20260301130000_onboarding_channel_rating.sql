create extension if not exists pgcrypto;

-- 1) 채널 마스터
create table if not exists youtube_channels (
  id uuid primary key default gen_random_uuid(),
  youtube_channel_id text unique,
  title text not null,
  category text,
  tags text[] default '{}',
  host_gender text,
  audience_age text,
  keywords text[] default '{}',
  thumbnail_url text,
  created_at timestamptz default now()
);

create index if not exists idx_youtube_channels_category on youtube_channels(category);
create index if not exists idx_youtube_channels_tags on youtube_channels using gin(tags);
create index if not exists idx_youtube_channels_keywords on youtube_channels using gin(keywords);

-- 2) 유저 평가 (온보딩)
create table if not exists user_channel_ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  channel_id uuid not null references youtube_channels(id) on delete cascade,
  score int not null check (score between 0 and 5), -- 0=스킵, 1~5=선호 강도
  created_at timestamptz default now(),
  unique (user_id, channel_id)
);

create index if not exists idx_ucr_user on user_channel_ratings(user_id, created_at desc);
create index if not exists idx_ucr_channel on user_channel_ratings(channel_id);

-- 3) 개인 취향 점수(채널 단위)
create or replace view user_taste_channel_score as
select
  user_id,
  channel_id,
  avg(score)::numeric as taste_score
from user_channel_ratings
group by user_id, channel_id;

-- 4) 개인화 추천(간단 버전: 채널 점수 + 태그 유사도)
-- 태그 유사도는 "내가 점수 높게 준 채널들의 태그"를 모아 가중
create or replace view user_tag_profile as
select
  r.user_id,
  unnest(c.tags) as tag,
  avg(r.score)::numeric as tag_score
from user_channel_ratings r
join youtube_channels c on c.id = r.channel_id
where r.score >= 3
group by r.user_id, unnest(c.tags);

create or replace view user_channel_personalized_score as
select
  c.id as channel_id,
  u.user_id,
  (
    coalesce(ts.taste_score, 0) * 0.7
    +
    coalesce(tagSum.tag_score_sum, 0) * 0.3
  ) as personalized_score
from youtube_channels c
cross join (select distinct user_id from user_channel_ratings) u
left join user_taste_channel_score ts
  on ts.user_id = u.user_id and ts.channel_id = c.id
left join (
  select
    ut.user_id,
    c2.id as channel_id,
    sum(coalesce(ut.tag_score,0)) as tag_score_sum
  from user_tag_profile ut
  join youtube_channels c2 on ut.tag = any(c2.tags)
  group by ut.user_id, c2.id
) tagSum
  on tagSum.user_id = u.user_id and tagSum.channel_id = c.id;

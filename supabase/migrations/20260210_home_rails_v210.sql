-- 1) 콘텐츠 마스터
create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text,
  thumbnail_url text,
  creator_name text,
  category text,
  platform text,
  status text not null default 'active', -- active, hidden, etc.
  created_at timestamptz not null default now()
);

create index if not exists idx_content_items_status_created
  on public.content_items (status, created_at desc);

-- 2) 이벤트(조회/클릭/관심) 집계용 (최소형)
-- 원래는 이벤트 로그 테이블을 따로 두고 rollup 하는 게 정석이지만,
-- MVP는 daily 카운터만 있어도 "승격/하강"이 돌아갑니다.
create table if not exists public.content_metrics_daily (
  content_id uuid not null references public.content_items(id) on delete cascade,
  day date not null,
  impressions bigint not null default 0,
  clicks bigint not null default 0,
  interests bigint not null default 0,
  watch_seconds bigint not null default 0, -- 체류의 대체값(동영상/상세)
  updated_at timestamptz not null default now(),
  primary key (content_id, day)
);

create index if not exists idx_metrics_day on public.content_metrics_daily (day desc);

-- 3) 레일 멤버십(자동 승격 결과를 저장)
create table if not exists public.rail_memberships (
  rail_key text not null,               -- 'top', 'experiment'
  content_id uuid not null references public.content_items(id) on delete cascade,
  score numeric not null default 0,
  reason_code text,                     -- v2.10: 'SIMILAR_TASTE' | 'RECENT_TREND' | 'GROWTH'
  reason_text text,                     -- v2.10: "최근 클릭 반응이 좋아서" 같은 한 줄
  decided_at timestamptz not null default now(),
  expires_at timestamptz,               -- experiment 레일은 만료 가능
  primary key (rail_key, content_id)
);

create index if not exists idx_rail_memberships_rail_score
  on public.rail_memberships (rail_key, score desc, decided_at desc);

-- 4) 실험 레일 자동 종료 로그(무소음 하강의 근거 기록)
create table if not exists public.rail_experiment_logs (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.content_items(id) on delete cascade,
  action text not null, -- 'PROMOTE' | 'DEMOTE' | 'KEEP'
  from_rail text,
  to_rail text,
  score numeric,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_experiment_logs_created on public.rail_experiment_logs (created_at desc);

-- 5) (옵션) 관심등록(사용자 취향 기반 이유에 쓰임)
create table if not exists public.user_interests (
  user_id uuid not null,
  content_id uuid not null references public.content_items(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, content_id)
);

create index if not exists idx_user_interests_user on public.user_interests (user_id, created_at desc);

-- 6) 홈 호출용 뷰(최근 7일 지표 합산)
create or replace view public.v_content_metrics_7d as
select
  ci.id as content_id,
  coalesce(sum(cmd.impressions),0) as impressions_7d,
  coalesce(sum(cmd.clicks),0)      as clicks_7d,
  coalesce(sum(cmd.interests),0)   as interests_7d,
  coalesce(sum(cmd.watch_seconds),0) as watch_seconds_7d
from public.content_items ci
left join public.content_metrics_daily cmd
  on cmd.content_id = ci.id
 and cmd.day >= (current_date - interval '6 day')
where ci.status = 'active'
group by ci.id;

-- (참고) RLS는 프로젝트 정책에 맞춰 별도 적용.

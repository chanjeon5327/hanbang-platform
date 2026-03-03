-- 1) 유저 평가 기록(온보딩/취향)
create table if not exists public.user_interest_ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  item_id text not null,
  score int not null check (score between 1 and 5),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, item_id)
);

-- updated_at 컬럼이 없으면 추가 (기존 마이그레이션 호환)
alter table public.user_interest_ratings
  add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_user_interest_ratings_user on public.user_interest_ratings(user_id);
create index if not exists idx_user_interest_ratings_item on public.user_interest_ratings(item_id);
create index if not exists idx_user_interest_ratings_user_updated on public.user_interest_ratings(user_id, updated_at desc);

-- 2) 개인화 뷰(1차): 최신 평가 + 점수 우선
create or replace view public.user_taste_score as
select
  user_id,
  item_id,
  score::float as taste_score,
  updated_at
from public.user_interest_ratings;

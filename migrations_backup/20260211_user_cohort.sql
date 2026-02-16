create table if not exists public.user_cohorts (
  user_id uuid primary key,
  cohort text not null, -- 'NEW' | 'ACTIVE' | 'POWER'
  decided_at timestamptz not null default now()
);

create index if not exists idx_user_cohorts_cohort
  on public.user_cohorts (cohort);

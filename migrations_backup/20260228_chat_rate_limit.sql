create table if not exists public.chat_rate_limit (
  user_id uuid not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_chat_rate_limit_user_time
on public.chat_rate_limit (user_id, created_at desc);

-- RLS: 본인만 insert/select (rate limit 체크용)
alter table public.chat_rate_limit enable row level security;

create policy "chat_rate_limit_insert_own"
  on public.chat_rate_limit for insert
  with check (auth.uid() = user_id);

create policy "chat_rate_limit_select_own"
  on public.chat_rate_limit for select
  using (auth.uid() = user_id);

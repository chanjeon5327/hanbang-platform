create table if not exists public.join_funnel (
  user_id uuid not null,
  content_id uuid not null references public.content_items(id) on delete cascade,
  source text not null default 'detail', -- home/detail/rail
  created_at timestamptz not null default now(),
  primary key (user_id, content_id)
);

create index if not exists idx_join_funnel_content on public.join_funnel (content_id, created_at desc);

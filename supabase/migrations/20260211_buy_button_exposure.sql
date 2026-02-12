create table if not exists public.buy_button_exposure (
  content_id uuid not null references public.content_items(id) on delete cascade,
  variant text not null, -- 'A' (권고 없음) | 'B' (권고 배지) | 'C' (매수 버튼)
  decided_at timestamptz not null default now(),
  primary key (content_id)
);

create index if not exists idx_buy_button_exposure_variant
  on public.buy_button_exposure (variant);

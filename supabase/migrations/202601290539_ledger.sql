-- supabase/migrations/202601290539_ledger.sql
-- HANBANG: Ledger (원장) 기반 정석 결제/자산 구조
-- 핵심:
-- 1) orders는 "요청/상태" / ledger_entries는 "확정 기록(단일 진실원)"
-- 2) 체결(completed) 시점에만 ledger가 써짐 (idempotent)
-- 3) 유저는 자기 ledger 조회만 가능, insert/update/delete는 service role(=서버)만

begin;

-- 0) 확장 (uuid)
create extension if not exists "pgcrypto";

-- 1) 주문 상태 ENUM (이미 있으면 건너뜀)
do $$
begin
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type public.order_status as enum ('created', 'pending', 'paid', 'completed', 'cancelled', 'failed');
  end if;
end $$;

-- 2) orders 테이블이 이미 있다면 "필수 컬럼만 보강"
--    없으면 최소 형태로 생성 (프로젝트에 이미 orders가 있으면 이 create는 실행 안 되도록 if로 처리)
do $$
begin
  if not exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'orders'
  ) then
    create table public.orders (
      id uuid primary key default gen_random_uuid(),
      buyer_id uuid not null,
      product_id uuid null,
      status public.order_status not null default 'created',
      total_amount_krw numeric(18,2) not null default 0,
      quantity numeric(18,6) not null default 0,
      completed_at timestamptz null,
      ledger_posted_at timestamptz null,
      metadata jsonb not null default '{}'::jsonb,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );

    create index on public.orders (buyer_id);
    create index on public.orders (status);
  else
    -- orders 존재 시 컬럼 보강 (없는 것만 추가)
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='orders' and column_name='buyer_id') then
      alter table public.orders add column buyer_id uuid;
    end if;

    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='orders' and column_name='status') then
      alter table public.orders add column status public.order_status not null default 'created';
    end if;

    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='orders' and column_name='total_amount_krw') then
      alter table public.orders add column total_amount_krw numeric(18,2) not null default 0;
    end if;

    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='orders' and column_name='quantity') then
      alter table public.orders add column quantity numeric(18,6) not null default 0;
    end if;

    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='orders' and column_name='completed_at') then
      alter table public.orders add column completed_at timestamptz null;
    end if;

    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='orders' and column_name='ledger_posted_at') then
      alter table public.orders add column ledger_posted_at timestamptz null;
    end if;

    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='orders' and column_name='metadata') then
      alter table public.orders add column metadata jsonb not null default '{}'::jsonb;
    end if;

    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='orders' and column_name='created_at') then
      alter table public.orders add column created_at timestamptz not null default now();
    end if;

    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='orders' and column_name='updated_at') then
      alter table public.orders add column updated_at timestamptz not null default now();
    end if;
  end if;
end $$;

-- 3) 원장 엔트리 테이블 (단일 진실원)
--    - cash(현금)와 asset(지분/상품)을 모두 기록 가능
--    - 한 order가 completed 되면 "현금 감소" + "자산 증가" 2줄이 찍히는 구조
create table if not exists public.ledger_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  order_id uuid null,
  entry_type text not null,            -- 'CASH_DEBIT' | 'ASSET_CREDIT' 등 (확장 가능)
  currency text not null default 'KRW', -- cash 통화
  amount numeric(18,2) not null default 0,    -- cash 변화(+/-)
  asset_id uuid null,                  -- 지분/상품 식별자(예: product_id 등을 그대로 넣어도 됨)
  quantity numeric(18,6) not null default 0,  -- 자산 변화(+/-)
  memo text null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists ledger_entries_user_id_idx on public.ledger_entries (user_id);
create index if not exists ledger_entries_order_id_idx on public.ledger_entries (order_id);
create index if not exists ledger_entries_asset_id_idx on public.ledger_entries (asset_id);

-- idempotency: 같은 order_id에 동일 entry_type이 중복으로 찍히지 않도록 unique
create unique index if not exists ledger_entries_order_type_uniq
  on public.ledger_entries (order_id, entry_type)
  where order_id is not null;

-- 4) updated_at 자동 갱신 트리거 (orders)
create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
before update on public.orders
for each row
execute function public.tg_set_updated_at();

-- 5) "체결 완료 시 원장 기록" 트리거 함수
--    조건:
--    - status가 completed로 바뀌는 순간 1회만 처리
--    - ledger_posted_at이 null일 때만 처리 (2중 방지)
create or replace function public.tg_post_ledger_on_order_completed()
returns trigger
language plpgsql
as $$
declare
  v_user uuid;
  v_asset uuid;
  v_cash numeric(18,2);
  v_qty numeric(18,6);
begin
  -- completed로 변하는 순간만
  if (tg_op = 'UPDATE') then
    if (old.status is distinct from new.status) and (new.status = 'completed') then

      -- 이미 원장 반영됐으면 스킵
      if new.ledger_posted_at is not null then
        return new;
      end if;

      v_user := new.buyer_id;
      v_asset := coalesce(new.product_id, (new.metadata->>'asset_id')::uuid);
      v_cash := coalesce(new.total_amount_krw, 0);
      v_qty  := coalesce(new.quantity, 0);

      -- 1) 현금 차감 (KRW -amount)
      insert into public.ledger_entries (
        user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata
      ) values (
        v_user, new.id, 'CASH_DEBIT', 'KRW', (v_cash * -1), null, 0,
        'Order completed: cash debit',
        jsonb_build_object('source', 'order', 'status', new.status)
      )
      on conflict do nothing;

      -- 2) 자산 증가 (+quantity)
      insert into public.ledger_entries (
        user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata
      ) values (
        v_user, new.id, 'ASSET_CREDIT', 'KRW', 0, v_asset, v_qty,
        'Order completed: asset credit',
        jsonb_build_object('source', 'order', 'status', new.status)
      )
      on conflict do nothing;

      -- orders에 posted_at 기록 + completed_at 보강
      new.ledger_posted_at := now();
      if new.completed_at is null then
        new.completed_at := now();
      end if;

      return new;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists post_ledger_on_order_completed on public.orders;
create trigger post_ledger_on_order_completed
before update on public.orders
for each row
execute function public.tg_post_ledger_on_order_completed();

-- 6) RLS: ledger_entries
alter table public.ledger_entries enable row level security;

-- 유저는 자기 원장만 조회 가능
drop policy if exists "ledger select own" on public.ledger_entries;
create policy "ledger select own"
on public.ledger_entries
for select
using (auth.uid() = user_id);

-- insert/update/delete는 기본적으로 막음(=클라이언트에서 사고 방지)
drop policy if exists "ledger insert none" on public.ledger_entries;
create policy "ledger insert none"
on public.ledger_entries
for insert
with check (false);

drop policy if exists "ledger update none" on public.ledger_entries;
create policy "ledger update none"
on public.ledger_entries
for update
using (false);

drop policy if exists "ledger delete none" on public.ledger_entries;
create policy "ledger delete none"
on public.ledger_entries
for delete
using (false);

-- 7) 포트폴리오(내 자산) 뷰: ledger 집계만 사용
--    - 현금 잔액: CASH_* amount 합
--    - 자산 수량: asset_id 기준 quantity 합
create or replace view public.v_my_cash_balance as
select
  user_id,
  currency,
  coalesce(sum(amount), 0) as cash_balance
from public.ledger_entries
where entry_type like 'CASH_%'
group by user_id, currency;

create or replace view public.v_my_asset_positions as
select
  user_id,
  asset_id,
  coalesce(sum(quantity), 0) as asset_quantity
from public.ledger_entries
where entry_type like 'ASSET_%'
group by user_id, asset_id;

commit;

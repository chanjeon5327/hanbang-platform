-- supabase/migrations/202601290625_orders_buyer_id_fix.sql
-- orders 테이블 buyer_id 보강 (RLS 전제조건)

begin;

-- 1) buyer_id 컬럼 추가 (없을 때만)
alter table public.orders
add column if not exists buyer_id uuid;

-- 2) 기존 주문 데이터가 있고 user_id 컬럼이 존재하면 buyer_id로 이관
--    (ledger_posted_at이 있는 정산완료 주문은 트리거로 잠겨 있어 제외)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='orders' and column_name='user_id'
  ) then
    update public.orders
    set buyer_id = user_id
    where buyer_id is null
      and ledger_posted_at is null;
  end if;
end $$;

-- 3) buyer_id NOT NULL 강제 (데이터 이관 후)
alter table public.orders
alter column buyer_id set not null;

-- 4) 조회/조인 성능 인덱스
create index if not exists orders_buyer_id_idx
on public.orders (buyer_id);

commit;

-- 20260127_010000_products_status_and_quantity.sql
-- 목적: products에 status/remaining_quantity 표준화 + trades(BUY) 발생 시 remaining_quantity 감소 + 0이면 ended 처리

-- 1) products 컬럼 정비 (이미 있으면 건너뜀)
alter table public.products
  add column if not exists status text default 'open';

alter table public.products
  add column if not exists total_quantity numeric;

alter table public.products
  add column if not exists remaining_quantity numeric;

-- 2) 기본값/정합성 (가능한 범위에서만 강제)
do $$
begin
  -- status 체크 제약(이미 있으면 예외로 무시)
  begin
    alter table public.products
      add constraint products_status_check
      check (status in ('open','closed','ended'));
  exception when duplicate_object then
    -- ignore
  end;

  -- remaining_quantity가 total_quantity보다 크면 안됨 (이미 있으면 예외로 무시)
  begin
    alter table public.products
      add constraint products_qty_check
      check (
        (total_quantity is null and remaining_quantity is null)
        or (total_quantity is not null and remaining_quantity is not null and remaining_quantity >= 0 and remaining_quantity <= total_quantity)
      );
  exception when duplicate_object then
    -- ignore
  end;
end $$;

-- 3) 기존 데이터 보정 (null이면 total_quantity를 remaining_quantity로 맞추거나, 반대로 맞춤)
update public.products
set
  total_quantity = coalesce(total_quantity, remaining_quantity),
  remaining_quantity = coalesce(remaining_quantity, total_quantity),
  status = coalesce(status, 'open')
where total_quantity is null or remaining_quantity is null or status is null;

-- 4) BUY 체결 시 products.remaining_quantity 감소 트리거 함수
create or replace function public.trg_apply_buy_to_product_quantity()
returns trigger
language plpgsql
as $$
declare
  v_qty numeric;
  v_remaining numeric;
  v_status text;
begin
  -- trades 테이블에서 BUY만 처리 (대소문자 혼재 방지)
  if coalesce(upper(new.type), '') <> 'BUY' then
    return new;
  end if;

  -- 수량이 없으면 1로 취급
  v_qty := coalesce(new.quantity, 1);

  -- products의 remaining_quantity가 null이면(total 기반 미세팅) 처리하지 않음(테스트/레거시 보호)
  select remaining_quantity, status into v_remaining, v_status
  from public.products
  where id = new.product_id
  for update;

  if v_remaining is null then
    return new;
  end if;

  if v_remaining - v_qty < 0 then
    raise exception 'Not enough remaining_quantity. product_id=% remaining=% qty=%', new.product_id, v_remaining, v_qty;
  end if;

  update public.products
  set
    remaining_quantity = remaining_quantity - v_qty,
    status = case
      when (remaining_quantity - v_qty) = 0 then 'ended'
      else status
    end
  where id = new.product_id;

  return new;
end;
$$;

-- 5) 트리거 생성 (이미 있으면 재생성)
drop trigger if exists apply_buy_to_product_quantity on public.trades;
create trigger apply_buy_to_product_quantity
after insert on public.trades
for each row
execute function public.trg_apply_buy_to_product_quantity();

-- 6) 스키마 캐시 리로드
notify pgrst, 'reload schema';

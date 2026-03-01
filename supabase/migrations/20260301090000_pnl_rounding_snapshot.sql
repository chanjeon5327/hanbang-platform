-- 1) trades에 정산/분석 컬럼 추가
alter table if exists trades
  add column if not exists subtotal_krw numeric,
  add column if not exists fee_krw numeric,
  add column if not exists total_krw numeric,
  add column if not exists realized_pnl_krw numeric;

-- 2) positions에 avg_price_krw가 없다면 추가(프로젝트에 이미 있으면 무시)
alter table if exists positions
  add column if not exists avg_price_krw numeric default 0;

-- 3) KRW 라운딩 규칙 함수(SSOT)
--    fee는 보수적으로 올림(ceil), 총액은 정수 KRW
create or replace function public.fn_fee_krw(subtotal numeric, fee_rate numeric)
returns numeric
language sql
immutable
as $$
  select ceil(coalesce(subtotal,0) * coalesce(fee_rate,0));
$$;

create or replace function public.fn_round_krw(x numeric)
returns numeric
language sql
immutable
as $$
  select round(coalesce(x,0));
$$;

-- 4) 일일 스냅샷 테이블(시장가/평가손익은 추후 확장)
create table if not exists positions_snapshot_daily (
  id uuid primary key default gen_random_uuid(),
  snap_date date not null,
  user_id uuid not null,
  item_id uuid not null,
  qty numeric not null,
  avg_price_krw numeric not null,
  created_at timestamptz default now(),
  unique (snap_date, user_id, item_id)
);

-- 5) 스냅샷 생성 RPC(해당 일자에 대해 positions 현재값을 upsert)
create or replace function public.rpc_snapshot_positions_daily(p_date date default current_date)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  insert into positions_snapshot_daily (snap_date, user_id, item_id, qty, avg_price_krw)
  select p_date, p.user_id, p.asset_id, p.quantity, coalesce(p.avg_price_krw, p.avg_price, 0)
  from positions p
  on conflict (snap_date, user_id, item_id)
  do update set
    qty = excluded.qty,
    avg_price_krw = excluded.avg_price_krw;

  get diagnostics v_count = row_count;

  return json_build_object('ok', true, 'snap_date', p_date, 'rows', v_count);
end;
$$;

grant execute on function public.rpc_snapshot_positions_daily(date) to authenticated;

-- avg_price_krw 동기화: positions.avg_price와 동일하게 유지
create or replace function public.fn_sync_avg_price_krw()
returns trigger language plpgsql as $$
begin
  new.avg_price_krw := coalesce(new.avg_price, 0);
  return new;
end;
$$;
drop trigger if exists trg_positions_sync_avg_price_krw on positions;
create trigger trg_positions_sync_avg_price_krw
  before insert or update of avg_price on positions
  for each row execute function public.fn_sync_avg_price_krw();

-- 기존 rows 백필
update positions set avg_price_krw = avg_price where avg_price_krw is null or (avg_price_krw = 0 and avg_price > 0);

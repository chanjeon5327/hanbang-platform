-- orders 상태/누적 체결 컬럼
alter table if exists orders
  add column if not exists status text default 'placed',
  add column if not exists filled_qty numeric default 0,
  add column if not exists remaining_qty numeric,
  add column if not exists avg_fill_price_krw numeric default 0;

-- remaining_qty 초기값을 quantity로 채우기(기존 데이터 보정)
update orders
set remaining_qty = quantity
where remaining_qty is null;

-- 기존 status 값을 새 상태 머신으로 정규화 (제약 추가 전)
update orders set status = 'filled' where status in ('FILLED','COMPLETED','PARTIAL');
update orders set status = 'canceled' where status in ('CANCELED','CANCELLED');
update orders set status = 'partial' where status = 'PARTIALLY_FILLED';
update orders set status = 'placed' where status is null or status not in ('placed','partial','filled','canceled');

-- status 체크(간단 제약)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'chk_orders_status'
  ) then
    alter table orders
    add constraint chk_orders_status
    check (status in ('placed','partial','filled','canceled'));
  end if;
end$$;

-- trades에 order_id, fill_seq 추가 (부분체결 순서 추적)
alter table if exists trades
  add column if not exists order_id uuid references orders(id),
  add column if not exists fill_seq int default 1;

create index if not exists idx_trades_order_id_seq
on trades(order_id, fill_seq);

-- ledger_entries에 trade_id 추가 (trade 단위 원장 기록용)
alter table if exists ledger_entries
  add column if not exists trade_id uuid;

-- 부분체결 시 동일 order에 CASH_DEBIT 여러 건 허용을 위해 중복 체크 트리거 제거
drop trigger if exists trg_ledger_cash_debit_duplicate_check on public.ledger_entries;

-- fn_update_position_on_ledger: trade_id가 있으면 해당 trade의 CASH_DEBIT만 사용 (부분체결 지원)
create or replace function public.fn_update_position_on_ledger()
returns trigger
language plpgsql security definer as $$
declare
  v_cost_per_unit  numeric(18,2);
  v_total_cost     numeric(18,2);
  v_sale_proceeds  numeric(18,2);
  v_sell_price     numeric(18,2);
  v_existing       record;
  v_pnl            numeric(18,2);
begin
  if new.entry_type in ('ASSET_CREDIT', 'TRADE_BUY', 'PRODUCT_PURCHASE')
     and new.asset_id is not null
     and new.quantity > 0
  then
    -- trade_id가 있으면 해당 trade의 CASH_DEBIT만 사용 (부분체결)
    if new.trade_id is not null then
      select coalesce(abs(sum(amount)), 0) into v_total_cost
      from public.ledger_entries
      where trade_id = new.trade_id and entry_type = 'CASH_DEBIT';
    else
      select coalesce(abs(sum(amount)), 0) into v_total_cost
      from public.ledger_entries
      where order_id = new.order_id and entry_type = 'CASH_DEBIT' and order_id is not null;
    end if;

    if v_total_cost = 0 or v_total_cost is null then v_total_cost := 0; end if;

    v_cost_per_unit := case when new.quantity > 0 then v_total_cost / new.quantity else 0 end;

    insert into public.positions (user_id, asset_id, quantity, avg_price, total_cost, realized_pnl)
    values (new.user_id, new.asset_id, new.quantity, v_cost_per_unit, v_total_cost, 0)
    on conflict (user_id, asset_id)
    do update set
      avg_price = case
        when (positions.quantity + excluded.quantity) > 0
        then (positions.quantity * positions.avg_price + excluded.quantity * v_cost_per_unit)
             / (positions.quantity + excluded.quantity)
        else positions.avg_price
      end,
      total_cost = positions.total_cost + v_total_cost,
      quantity   = positions.quantity + excluded.quantity,
      updated_at = now();
  end if;

  if new.entry_type in ('ASSET_DEBIT', 'TRADE_SELL', 'PRODUCT_SELL')
     and new.asset_id is not null
     and new.quantity > 0
  then
    select quantity, avg_price, realized_pnl into v_existing
    from public.positions
    where user_id = new.user_id and asset_id = new.asset_id;

    if v_existing is not null and v_existing.quantity > 0 then
      if new.trade_id is not null then
        select coalesce(sum(amount), 0) into v_sale_proceeds
        from public.ledger_entries
        where trade_id = new.trade_id and entry_type = 'CASH_CREDIT';
      else
        select coalesce(sum(amount), 0) into v_sale_proceeds
        from public.ledger_entries
        where order_id = new.order_id and entry_type = 'CASH_CREDIT' and order_id is not null;
      end if;

      v_sell_price := case when new.quantity > 0 then v_sale_proceeds / new.quantity else 0 end;
      v_pnl := (v_sell_price - v_existing.avg_price) * least(new.quantity, v_existing.quantity);

      update public.positions
      set quantity     = greatest(0, quantity - new.quantity),
          realized_pnl = realized_pnl + coalesce(v_pnl, 0),
          total_cost   = greatest(0, total_cost - v_existing.avg_price * least(new.quantity, v_existing.quantity)),
          updated_at   = now()
      where user_id = new.user_id and asset_id = new.asset_id;
    end if;
  end if;

  return new;
end;
$$;

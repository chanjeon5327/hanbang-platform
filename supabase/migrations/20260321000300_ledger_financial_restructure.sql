-- 1) NOT NULL 해제 (이미 적용되었을 수 있으므로 안전 처리)
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_name='ledger_entries'
      and column_name='order_id'
      and is_nullable='NO'
  ) then
    alter table ledger_entries
      alter column order_id drop not null;
  end if;
end$$;

-- 2) FK는 유지 (NULL 허용)
-- (이미 존재하면 건너뜀)

-- 3) entry_type 기반 무결성 제약
-- 거래형 이벤트는 반드시 order_id 필요

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname='chk_ledger_order_required_for_trade'
  ) then
    alter table ledger_entries
      add constraint chk_ledger_order_required_for_trade
      check (
        (entry_type in ('TRADE_BUY','TRADE_SELL','TRADE_FEE') and order_id is not null)
        or
        (entry_type not in ('TRADE_BUY','TRADE_SELL','TRADE_FEE'))
      );
  end if;
end$$;

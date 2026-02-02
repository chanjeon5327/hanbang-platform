-- =========================================================
-- RPC: 투자 집행 (paid 주문 → 원장 자동 기록)
-- =========================================================
create or replace function rpc_invest(p_order_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_order record;
begin
  -- 1️⃣ 주문 조회 (paid 상태만 허용)
  select *
    into v_order
  from orders
  where id = p_order_id
    and status = 'paid'
  for update;

  if not found then
    raise exception 'ORDER_NOT_PAID_OR_NOT_FOUND';
  end if;

  -- 2️⃣ 중복 원장 방지 (이미 처리된 주문 차단)
  if exists (
    select 1
    from ledger_entries
    where ref_order_id = v_order.id
  ) then
    raise exception 'LEDGER_ALREADY_POSTED';
  end if;

  -- 3️⃣ 구매자 CASH 차감
  insert into ledger_entries (
    user_id,
    entry_type,
    amount,
    ref_order_id,
    description
  ) values (
    v_order.buyer_id,
    'CASH_DEBIT',
    v_order.total_price * -1,
    v_order.id,
    '투자 집행 - 현금 차감'
  );

  -- 4️⃣ 구매자 ASSET 증가
  insert into ledger_entries (
    user_id,
    entry_type,
    amount,
    ref_order_id,
    product_id,
    description
  ) values (
    v_order.buyer_id,
    'ASSET_CREDIT',
    v_order.quantity,
    v_order.id,
    v_order.product_id,
    '투자 집행 - 자산 취득'
  );

  -- 5️⃣ 주문에 원장 게시 시각 기록 (불변성 시작점)
  update orders
  set ledger_posted_at = now()
  where id = v_order.id;

end;
$$;

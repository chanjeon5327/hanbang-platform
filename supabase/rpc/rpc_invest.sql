create or replace function rpc_invest(
  p_product_id uuid
)
returns void
language plpgsql
security definer
as $$
declare
  v_user_id uuid;
  v_price numeric;
  v_remaining integer;
  v_order_id uuid;
begin
  -- 1️⃣ 로그인 사용자 확인
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  -- 2️⃣ 상품 잠금 조회
  select price, remaining_supply
  into v_price, v_remaining
  from products
  where id = p_product_id
  for update;

  if not found then
    raise exception 'PRODUCT_NOT_FOUND';
  end if;

  if v_remaining <= 0 then
    raise exception 'SOLD_OUT';
  end if;

  -- 3️⃣ 주문 생성
  insert into orders (
    user_id,
    product_id,
    status,
    amount
  ) values (
    v_user_id,
    p_product_id,
    'completed',
    v_price
  )
  returning id into v_order_id;

  -- 4️⃣ 구매자 원장 기록 (현금 차감)
  insert into ledger_entries (
    user_id,
    order_id,
    entry_type,
    amount
  ) values (
    v_user_id,
    v_order_id,
    'CASH_DEBIT',
    v_price
  );

  -- 5️⃣ 구매자 원장 기록 (자산 취득)
  insert into ledger_entries (
    user_id,
    order_id,
    entry_type,
    amount
  ) values (
    v_user_id,
    v_order_id,
    'ASSET_CREDIT',
    1
  );

  -- 6️⃣ 상품 잔여 수량 감소
  update products
  set remaining_supply = remaining_supply - 1
  where id = p_product_id;

end;
$$;

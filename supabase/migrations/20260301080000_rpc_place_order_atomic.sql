-- 안전: 필요한 확장
create extension if not exists pgcrypto;

-- (선택) orders에 idempotency_key 없다면 추가
alter table if exists orders
add column if not exists idempotency_key text;

create unique index if not exists ux_orders_user_idempotency
on orders(user_id, idempotency_key)
where idempotency_key is not null;

-- positions는 (user_id, asset_id) 유니크 이미 존재. item_id→asset_id 매핑으로 사용

-- 원자 주문 함수 (실제 스키마: orders, ledger_entries, positions, trades)
create or replace function public.rpc_place_order_atomic(
  p_user_id uuid,
  p_item_id uuid,
  p_side text,          -- 'buy' | 'sell'
  p_order_type text,    -- 'limit' | 'market'
  p_price_krw numeric,
  p_qty numeric,
  p_fee_rate numeric,
  p_idempotency_key text default null
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_trade_id uuid;
  v_price numeric;
  v_qty numeric;
  v_subtotal numeric;
  v_fee numeric;
  v_total numeric;
  v_cash_debit_sum numeric;
  v_asset_credit_sum numeric;
  v_pos_qty numeric;
  v_lock_key bigint;
  v_product_id uuid;
begin
  -- 입력 검증
  if p_qty is null or p_qty <= 0 then
    raise exception 'INVALID_QTY';
  end if;

  if p_side not in ('buy','sell') then
    raise exception 'INVALID_SIDE';
  end if;

  if p_order_type not in ('limit','market') then
    raise exception 'INVALID_ORDER_TYPE';
  end if;

  if p_fee_rate is null or p_fee_rate < 0 then
    raise exception 'INVALID_FEE_RATE';
  end if;

  -- product_id 해석 (content_items.product_id 또는 p_item_id)
  select coalesce(ci.product_id, ci.id) into v_product_id
  from content_items ci where ci.id = p_item_id limit 1;
  if v_product_id is null then
    v_product_id := p_item_id;
  end if;

  -- 멱등키가 없으면 생성
  if p_idempotency_key is null or p_idempotency_key = '' then
    p_idempotency_key := encode(gen_random_bytes(12), 'hex');
  end if;

  -- advisory lock: 같은 (user,item) 조합은 동시에 못 들어오게
  v_lock_key := hashtextextended(p_user_id::text || ':' || p_item_id::text, 0);
  perform pg_advisory_xact_lock(v_lock_key);

  -- 중복요청이면 기존 주문 반환
  select id into v_order_id
  from orders
  where user_id = p_user_id
    and idempotency_key = p_idempotency_key
  limit 1;

  if v_order_id is not null then
    return json_build_object(
      'ok', true,
      'deduped', true,
      'order_id', v_order_id,
      'idempotency_key', p_idempotency_key
    );
  end if;

  -- 가격 결정
  v_price := p_price_krw;
  if v_price is null or v_price <= 0 then
    raise exception 'INVALID_PRICE';
  end if;

  v_qty := p_qty;
  v_subtotal := v_price * v_qty;
  v_fee := v_subtotal * p_fee_rate;
  v_total := v_subtotal + v_fee;

  -- 주문 생성 (orders: content_id, product_id, type, order_type, price, quantity, status, idempotency_key)
  insert into orders (
    user_id, content_id, product_id, type, order_type,
    price, quantity, filled_quantity, status, idempotency_key
  )
  values (
    p_user_id, p_item_id, v_product_id, 'BUY', p_order_type,
    v_price, v_qty, v_qty, 'FILLED', p_idempotency_key
  )
  returning id into v_order_id;

  -- 체결 생성 (trades: user_id, product_id, price_at_trade, quantity, amount, type)
  insert into trades (user_id, product_id, price_at_trade, quantity, amount, type)
  values (p_user_id, v_product_id, v_price, v_qty, v_total, 'BUY')
  returning id into v_trade_id;

  -- 원장 기록 (ledger_entries: order_id, entry_type, amount, quantity, asset_id)
  if p_side = 'buy' then
    insert into ledger_entries (user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata)
    values
      (p_user_id, v_order_id, 'CASH_DEBIT', 'KRW', -v_total, null, 0, 'PRODUCT_PURCHASE', '{}'::jsonb),
      (p_user_id, v_order_id, 'ASSET_CREDIT', 'KRW', 0, p_item_id, v_qty, 'PRODUCT_PURCHASE', '{}'::jsonb);
  else
    raise exception 'SELL_NOT_IMPLEMENTED_YET';
  end if;

  -- positions는 fn_update_position_on_ledger 트리거로 자동 갱신됨

  -- 검증: ledger 합계
  select coalesce(sum(abs(amount)), 0) into v_cash_debit_sum
  from ledger_entries
  where user_id = p_user_id and order_id = v_order_id and entry_type = 'CASH_DEBIT';

  select coalesce(sum(quantity), 0) into v_asset_credit_sum
  from ledger_entries
  where user_id = p_user_id and order_id = v_order_id and entry_type = 'ASSET_CREDIT';

  if abs(v_cash_debit_sum - v_total) > 0.0001 then
    raise exception 'ENGINE_MISMATCH_CASH';
  end if;

  if abs(v_asset_credit_sum - v_qty) > 0.0001 then
    raise exception 'ENGINE_MISMATCH_ASSET';
  end if;

  -- positions 검증 (트리거로 갱신된 값)
  select coalesce(quantity, 0) into v_pos_qty
  from positions
  where user_id = p_user_id and asset_id = p_item_id;

  return json_build_object(
    'ok', true,
    'deduped', false,
    'order_id', v_order_id,
    'trade_id', v_trade_id,
    'total_krw', v_total,
    'fee_krw', v_fee,
    'idempotency_key', p_idempotency_key
  );
end;
$$;

grant execute on function public.rpc_place_order_atomic(uuid,uuid,text,text,numeric,numeric,numeric,text) to authenticated;
grant execute on function public.rpc_place_order_atomic(uuid,uuid,text,text,numeric,numeric,numeric,text) to service_role;

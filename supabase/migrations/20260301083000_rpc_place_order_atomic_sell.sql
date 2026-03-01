create extension if not exists pgcrypto;

-- rpc_place_order_atomic: SELL 분기 추가 (실제 스키마: orders, ledger_entries, positions, trades)
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
  v_cash_credit_sum numeric;
  v_asset_credit_sum numeric;
  v_asset_debit_sum numeric;

  v_pos_qty numeric;
  v_lock_key bigint;
  v_product_id uuid;
begin
  if p_qty is null or p_qty <= 0 then raise exception 'INVALID_QTY'; end if;
  if p_side not in ('buy','sell') then raise exception 'INVALID_SIDE'; end if;
  if p_order_type not in ('limit','market') then raise exception 'INVALID_ORDER_TYPE'; end if;
  if p_fee_rate is null or p_fee_rate < 0 then raise exception 'INVALID_FEE_RATE'; end if;

  -- product_id 해석
  select coalesce(ci.product_id, ci.id) into v_product_id
  from content_items ci where ci.id = p_item_id limit 1;
  if v_product_id is null then v_product_id := p_item_id; end if;

  if p_idempotency_key is null or p_idempotency_key = '' then
    p_idempotency_key := encode(gen_random_bytes(12), 'hex');
  end if;

  -- advisory lock
  v_lock_key := hashtextextended(p_user_id::text || ':' || p_item_id::text, 0);
  perform pg_advisory_xact_lock(v_lock_key);

  -- 중복요청
  select id into v_order_id
  from orders
  where user_id = p_user_id and idempotency_key = p_idempotency_key
  limit 1;

  if v_order_id is not null then
    return json_build_object('ok', true, 'deduped', true, 'order_id', v_order_id, 'idempotency_key', p_idempotency_key);
  end if;

  v_price := p_price_krw;
  if v_price is null or v_price <= 0 then raise exception 'INVALID_PRICE'; end if;

  v_qty := p_qty;
  v_subtotal := v_price * v_qty;
  v_fee := v_subtotal * p_fee_rate;

  -- buy: total = subtotal + fee / sell: net = subtotal - fee
  if p_side = 'buy' then
    v_total := v_subtotal + v_fee;
  else
    v_total := v_subtotal - v_fee;
    if v_total < 0 then raise exception 'INVALID_TOTAL'; end if;
  end if;

  -- 보유수량 검사(SELL)
  if p_side = 'sell' then
    select coalesce(quantity, 0) into v_pos_qty
    from positions
    where user_id = p_user_id and asset_id = p_item_id;

    if v_pos_qty is null or v_pos_qty < v_qty then
      raise exception 'INSUFFICIENT_POSITION';
    end if;
  end if;

  -- 주문 생성
  insert into orders (user_id, content_id, product_id, type, order_type, price, quantity, filled_quantity, status, idempotency_key)
  values (p_user_id, p_item_id, v_product_id, upper(p_side), p_order_type, v_price, v_qty, v_qty, 'FILLED', p_idempotency_key)
  returning id into v_order_id;

  -- 체결 생성
  insert into trades (user_id, product_id, price_at_trade, quantity, amount, type)
  values (p_user_id, v_product_id, v_price, v_qty, case when p_side = 'buy' then v_subtotal + v_fee else v_subtotal - v_fee end, upper(p_side))
  returning id into v_trade_id;

  if p_side = 'buy' then
    -- BUY 원장
    insert into ledger_entries (user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata)
    values
      (p_user_id, v_order_id, 'CASH_DEBIT', 'KRW', -(v_subtotal + v_fee), null, 0, 'PRODUCT_PURCHASE', '{}'::jsonb),
      (p_user_id, v_order_id, 'ASSET_CREDIT', 'KRW', 0, p_item_id, v_qty, 'PRODUCT_PURCHASE', '{}'::jsonb);

    -- positions는 fn_update_position_on_ledger 트리거로 자동 갱신

    -- 검증(BUY)
    select coalesce(sum(abs(amount)), 0) into v_cash_debit_sum
    from ledger_entries where user_id = p_user_id and order_id = v_order_id and entry_type = 'CASH_DEBIT';

    select coalesce(sum(quantity), 0) into v_asset_credit_sum
    from ledger_entries where user_id = p_user_id and order_id = v_order_id and entry_type = 'ASSET_CREDIT';

    if abs(v_cash_debit_sum - (v_subtotal + v_fee)) > 0.0001 then raise exception 'ENGINE_MISMATCH_CASH'; end if;
    if abs(v_asset_credit_sum - v_qty) > 0.0001 then raise exception 'ENGINE_MISMATCH_ASSET'; end if;

    return json_build_object(
      'ok', true, 'deduped', false, 'order_id', v_order_id, 'trade_id', v_trade_id,
      'side', p_side, 'subtotal_krw', v_subtotal, 'fee_krw', v_fee,
      'total_krw', v_subtotal + v_fee, 'idempotency_key', p_idempotency_key
    );

  else
    -- SELL 원장: CASH_CREDIT 먼저(트리거가 ASSET_DEBIT 시 CASH_CREDIT 참조)
    insert into ledger_entries (user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata)
    values
      (p_user_id, v_order_id, 'CASH_CREDIT', 'KRW', v_subtotal - v_fee, null, 0, 'PRODUCT_SELL', '{}'::jsonb),
      (p_user_id, v_order_id, 'ASSET_DEBIT', 'KRW', 0, p_item_id, v_qty, 'PRODUCT_SELL', '{}'::jsonb);

    -- positions는 fn_update_position_on_ledger 트리거로 자동 감소

    -- 검증(SELL)
    select coalesce(sum(quantity), 0) into v_asset_debit_sum
    from ledger_entries where user_id = p_user_id and order_id = v_order_id and entry_type = 'ASSET_DEBIT';

    select coalesce(sum(amount), 0) into v_cash_credit_sum
    from ledger_entries where user_id = p_user_id and order_id = v_order_id and entry_type = 'CASH_CREDIT';

    if abs(v_asset_debit_sum - v_qty) > 0.0001 then raise exception 'ENGINE_MISMATCH_ASSET_SELL'; end if;
    if abs(v_cash_credit_sum - (v_subtotal - v_fee)) > 0.0001 then raise exception 'ENGINE_MISMATCH_CASH_SELL'; end if;

    return json_build_object(
      'ok', true, 'deduped', false, 'order_id', v_order_id, 'trade_id', v_trade_id,
      'side', p_side, 'subtotal_krw', v_subtotal, 'fee_krw', v_fee,
      'net_credit_krw', v_subtotal - v_fee, 'idempotency_key', p_idempotency_key
    );
  end if;

end;
$$;

grant execute on function public.rpc_place_order_atomic(uuid,uuid,text,text,numeric,numeric,numeric,text) to authenticated;
grant execute on function public.rpc_place_order_atomic(uuid,uuid,text,text,numeric,numeric,numeric,text) to service_role;

-- 매칭엔진 RPC
-- orders: content_id(item), type(BUY/SELL), price, remaining_qty
-- positions: asset_id(item), quantity
-- ledger 기반 포지션 갱신 (트리거)
create or replace function public.rpc_match_orders(
  p_item_id uuid
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_buy record;
  v_sell record;

  v_match_qty numeric;
  v_trade_price numeric;
  v_trade_id_buy uuid;
  v_trade_id_sell uuid;

  v_buy_total numeric;
  v_sell_total numeric;
  v_product_id uuid;
  v_seller_pos numeric;
begin
  -- product_id 해석
  select coalesce(ci.product_id, ci.id) into v_product_id
  from content_items ci where ci.id = p_item_id limit 1;
  if v_product_id is null then v_product_id := p_item_id; end if;

  -- 가장 높은 BUY와 가장 낮은 SELL 찾기 (content_id = item)
  select * into v_buy
  from orders
  where content_id = p_item_id and type = 'BUY' and status in ('placed','partial')
  order by price desc, created_at asc
  limit 1
  for update skip locked;

  select * into v_sell
  from orders
  where content_id = p_item_id and type = 'SELL' and status in ('placed','partial')
  order by price asc, created_at asc
  limit 1
  for update skip locked;

  if v_buy.id is null or v_sell.id is null then
    return json_build_object('ok', true, 'matched', false);
  end if;

  if v_buy.price < v_sell.price then
    return json_build_object('ok', true, 'matched', false);
  end if;

  v_match_qty := least(coalesce(v_buy.remaining_qty, v_buy.quantity), coalesce(v_sell.remaining_qty, v_sell.quantity));
  if v_match_qty <= 0 then
    return json_build_object('ok', true, 'matched', false);
  end if;

  v_trade_price := v_sell.price;  -- 체결가는 매도호가 기준

  -- SELL 포지션 확인
  select coalesce(quantity, 0) into v_seller_pos
  from positions
  where user_id = v_sell.user_id and asset_id = p_item_id;

  if v_seller_pos is null or v_seller_pos < v_match_qty then
    raise exception 'INSUFFICIENT_SELLER_POSITION';
  end if;

  v_buy_total := public.fn_round_krw(v_trade_price * v_match_qty);
  v_sell_total := v_buy_total;

  -- trade 1: BUY 측
  insert into trades (order_id, user_id, product_id, price_at_trade, quantity, amount, type, fill_seq, subtotal_krw, fee_krw, total_krw)
  values (v_buy.id, v_buy.user_id, v_product_id, v_trade_price, v_match_qty, v_buy_total, 'BUY', 1, v_buy_total, 0, v_buy_total)
  returning id into v_trade_id_buy;

  -- trade 2: SELL 측
  insert into trades (order_id, user_id, product_id, price_at_trade, quantity, amount, type, fill_seq, subtotal_krw, fee_krw, total_krw)
  values (v_sell.id, v_sell.user_id, v_product_id, v_trade_price, v_match_qty, v_sell_total, 'SELL', 1, v_sell_total, 0, v_sell_total)
  returning id into v_trade_id_sell;

  -- BUY 원장: CASH_DEBIT + ASSET_CREDIT
  insert into ledger_entries (user_id, order_id, trade_id, entry_type, currency, amount, asset_id, quantity, memo, metadata)
  values
    (v_buy.user_id, v_buy.id, v_trade_id_buy, 'CASH_DEBIT', 'KRW', -v_buy_total, null, 0, '매칭 매수', '{}'::jsonb),
    (v_buy.user_id, v_buy.id, v_trade_id_buy, 'ASSET_CREDIT', 'KRW', 0, p_item_id, v_match_qty, '매칭 매수', '{}'::jsonb);

  -- SELL 원장: ASSET_DEBIT + CASH_CREDIT
  insert into ledger_entries (user_id, order_id, trade_id, entry_type, currency, amount, asset_id, quantity, memo, metadata)
  values
    (v_sell.user_id, v_sell.id, v_trade_id_sell, 'ASSET_DEBIT', 'KRW', 0, p_item_id, v_match_qty, '매칭 매도', '{}'::jsonb),
    (v_sell.user_id, v_sell.id, v_trade_id_sell, 'CASH_CREDIT', 'KRW', v_sell_total, null, 0, '매칭 매도', '{}'::jsonb);

  -- 주문 상태 갱신
  update orders
  set filled_qty = coalesce(filled_qty, 0) + v_match_qty,
      remaining_qty = coalesce(remaining_qty, quantity) - v_match_qty,
      filled_quantity = coalesce(filled_quantity, 0) + v_match_qty,
      status = case when coalesce(remaining_qty, quantity) - v_match_qty <= 0 then 'filled' else 'partial' end
  where id = v_buy.id;

  update orders
  set filled_qty = coalesce(filled_qty, 0) + v_match_qty,
      remaining_qty = coalesce(remaining_qty, quantity) - v_match_qty,
      filled_quantity = coalesce(filled_quantity, 0) + v_match_qty,
      status = case when coalesce(remaining_qty, quantity) - v_match_qty <= 0 then 'filled' else 'partial' end
  where id = v_sell.id;

  return json_build_object(
    'ok', true,
    'matched', true,
    'qty', v_match_qty,
    'price', v_trade_price,
    'buy_order_id', v_buy.id,
    'sell_order_id', v_sell.id,
    'trade_id_buy', v_trade_id_buy,
    'trade_id_sell', v_trade_id_sell
  );
end;
$$;

grant execute on function public.rpc_match_orders(uuid) to authenticated;
grant execute on function public.rpc_match_orders(uuid) to service_role;

-- placed 전용 주문 생성 (매칭 대기용)
create or replace function public.rpc_place_order_limit(
  p_user_id uuid,
  p_item_id uuid,
  p_side text,
  p_price_krw numeric,
  p_qty numeric,
  p_idempotency_key text default null
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_product_id uuid;
  v_lock_key bigint;
  v_existing uuid;
begin
  if p_qty is null or p_qty <= 0 then raise exception 'INVALID_QTY'; end if;
  if p_side not in ('buy','sell') then raise exception 'INVALID_SIDE'; end if;
  if p_price_krw is null or p_price_krw <= 0 then raise exception 'INVALID_PRICE'; end if;

  select coalesce(ci.product_id, ci.id) into v_product_id
  from content_items ci where ci.id = p_item_id limit 1;
  if v_product_id is null then v_product_id := p_item_id; end if;

  if p_idempotency_key is null or p_idempotency_key = '' then
    p_idempotency_key := encode(gen_random_bytes(12), 'hex');
  end if;

  v_lock_key := hashtextextended(p_user_id::text || ':' || p_item_id::text, 0);
  perform pg_advisory_xact_lock(v_lock_key);

  select id into v_existing
  from orders
  where user_id = p_user_id and idempotency_key = p_idempotency_key
  limit 1;

  if v_existing is not null then
    return json_build_object('ok', true, 'deduped', true, 'order_id', v_existing, 'idempotency_key', p_idempotency_key);
  end if;

  insert into orders (
    user_id, content_id, product_id, type, order_type, price, quantity,
    filled_quantity, status, idempotency_key, filled_qty, remaining_qty, avg_fill_price_krw
  )
  values (
    p_user_id, p_item_id, v_product_id, upper(p_side), 'limit', p_price_krw, p_qty,
    0, 'placed', p_idempotency_key, 0, p_qty, 0
  )
  returning id into v_order_id;

  return json_build_object(
    'ok', true,
    'order_id', v_order_id,
    'status', 'placed',
    'remaining_qty', p_qty,
    'idempotency_key', p_idempotency_key
  );
end;
$$;

grant execute on function public.rpc_place_order_limit(uuid,uuid,text,numeric,numeric,text) to authenticated;
grant execute on function public.rpc_place_order_limit(uuid,uuid,text,numeric,numeric,text) to service_role;

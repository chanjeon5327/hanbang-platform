-- rpc_place_order_atomic: ORDER_CREATED 감사로그 추가
create or replace function public.rpc_place_order_atomic(
  p_user_id uuid,
  p_item_id uuid,
  p_side text,
  p_order_type text,
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
  v_trade_id1 uuid;
  v_trade_id2 uuid;
  v_price numeric;
  v_qty numeric;
  v_fill1 numeric;
  v_fill2 numeric;
  v_sub1 numeric; v_fee1 numeric; v_total1 numeric;
  v_sub2 numeric; v_fee2 numeric; v_total2 numeric;
  v_lock_key bigint;
  v_existing uuid;
  v_product_id uuid;
  v_filled_qty numeric;
  v_remaining numeric;
  v_avg_fill numeric;
begin
  if p_qty is null or p_qty <= 0 then raise exception 'INVALID_QTY'; end if;
  if p_side not in ('buy','sell') then raise exception 'INVALID_SIDE'; end if;
  if p_order_type not in ('limit','market') then raise exception 'INVALID_ORDER_TYPE'; end if;
  if p_fee_rate is null or p_fee_rate < 0 then raise exception 'INVALID_FEE_RATE'; end if;

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

  v_price := p_price_krw;
  if v_price is null or v_price <= 0 then raise exception 'INVALID_PRICE'; end if;

  v_qty := p_qty;

  insert into orders (
    user_id, content_id, product_id, type, order_type, price, quantity,
    filled_quantity, status, idempotency_key, filled_qty, remaining_qty, avg_fill_price_krw
  )
  values (
    p_user_id, p_item_id, v_product_id, upper(p_side), p_order_type, v_price, v_qty,
    0, 'placed', p_idempotency_key, 0, v_qty, 0
  )
  returning id into v_order_id;

  insert into audit_logs(user_id,action,ref_type,ref_id,metadata)
  values (p_user_id,'ORDER_CREATED','order',v_order_id,
          json_build_object('qty',p_qty,'price',p_price_krw));

  if p_side <> 'buy' then
    raise exception 'SELL_PARTIAL_NOT_IMPLEMENTED_YET';
  end if;

  v_fill1 := floor(v_qty * 0.6);
  if v_fill1 < 1 then v_fill1 := 1; end if;
  v_fill2 := v_qty - v_fill1;

  v_sub1 := public.fn_round_krw(v_price * v_fill1);
  v_fee1 := public.fn_fee_krw(v_sub1, p_fee_rate);
  v_total1 := v_sub1 + v_fee1;

  insert into trades (order_id, user_id, product_id, price_at_trade, quantity, amount, type, fill_seq, subtotal_krw, fee_krw, total_krw)
  values (v_order_id, p_user_id, v_product_id, v_price, v_fill1, v_total1, 'BUY', 1, v_sub1, v_fee1, v_total1)
  returning id into v_trade_id1;

  update orders
  set filled_qty = filled_qty + v_fill1,
      remaining_qty = remaining_qty - v_fill1
  where id = v_order_id;

  insert into ledger_entries (user_id, order_id, trade_id, entry_type, currency, amount, asset_id, quantity, memo, metadata)
  values
    (p_user_id, v_order_id, v_trade_id1, 'ASSET_CREDIT', 'KRW', 0, p_item_id, v_fill1, 'PRODUCT_PURCHASE', jsonb_build_object('fill_seq', 1)),
    (p_user_id, v_order_id, v_trade_id1, 'CASH_DEBIT', 'KRW', -v_total1, null, 0, 'PRODUCT_PURCHASE', jsonb_build_object('fill_seq', 1));

  insert into audit_logs(user_id,action,ref_type,ref_id,metadata)
  values (p_user_id,'TRADE_EXECUTED','trade',v_trade_id1,
          json_build_object('qty',v_fill1,'price',v_price));

  if v_fill2 > 0 then
    v_sub2 := public.fn_round_krw(v_price * v_fill2);
    v_fee2 := public.fn_fee_krw(v_sub2, p_fee_rate);
    v_total2 := v_sub2 + v_fee2;

    insert into trades (order_id, user_id, product_id, price_at_trade, quantity, amount, type, fill_seq, subtotal_krw, fee_krw, total_krw)
    values (v_order_id, p_user_id, v_product_id, v_price, v_fill2, v_total2, 'BUY', 2, v_sub2, v_fee2, v_total2)
    returning id into v_trade_id2;

    update orders
    set filled_qty = filled_qty + v_fill2,
        remaining_qty = remaining_qty - v_fill2
    where id = v_order_id;

    insert into ledger_entries (user_id, order_id, trade_id, entry_type, currency, amount, asset_id, quantity, memo, metadata)
    values
      (p_user_id, v_order_id, v_trade_id2, 'ASSET_CREDIT', 'KRW', 0, p_item_id, v_fill2, 'PRODUCT_PURCHASE', jsonb_build_object('fill_seq', 2)),
      (p_user_id, v_order_id, v_trade_id2, 'CASH_DEBIT', 'KRW', -v_total2, null, 0, 'PRODUCT_PURCHASE', jsonb_build_object('fill_seq', 2));

    insert into audit_logs(user_id,action,ref_type,ref_id,metadata)
    values (p_user_id,'TRADE_EXECUTED','trade',v_trade_id2,
            json_build_object('qty',v_fill2,'price',v_price));
  end if;

  select filled_qty, remaining_qty into v_filled_qty, v_remaining
  from orders where id = v_order_id;

  select case when v_filled_qty = 0 then 0 else sum(subtotal_krw) / v_filled_qty end
  into v_avg_fill
  from trades where order_id = v_order_id;

  update orders
  set avg_fill_price_krw = coalesce(v_avg_fill, 0),
      status = case
        when remaining_qty = 0 or remaining_qty is null then 'filled'
        when filled_qty > 0 then 'partial'
        else 'placed'
      end,
      filled_quantity = filled_qty
  where id = v_order_id;

  select filled_qty, remaining_qty into v_filled_qty, v_remaining
  from orders where id = v_order_id;

  if abs(v_filled_qty - v_qty) > 0.0001 then raise exception 'ENGINE_PARTIAL_MISMATCH_QTY'; end if;
  if coalesce(v_remaining, 0) > 0.0001 then raise exception 'ENGINE_PARTIAL_MISMATCH_REMAIN'; end if;

  return json_build_object(
    'ok', true,
    'order_id', v_order_id,
    'trade_ids', case when v_fill2 > 0 then json_build_array(v_trade_id1, v_trade_id2) else json_build_array(v_trade_id1) end,
    'trade_id', v_trade_id1,
    'filled_qty', v_filled_qty,
    'remaining_qty', 0,
    'avg_fill_price_krw', v_avg_fill,
    'status', 'filled',
    'subtotal_krw', v_sub1 + coalesce(v_sub2, 0),
    'fee_krw', v_fee1 + coalesce(v_fee2, 0),
    'total_krw', v_total1 + coalesce(v_total2, 0),
    'idempotency_key', p_idempotency_key
  );
end;
$$;

-- rpc_match_orders: TRADE_EXECUTED 감사로그 추가
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
  select coalesce(ci.product_id, ci.id) into v_product_id
  from content_items ci where ci.id = p_item_id limit 1;
  if v_product_id is null then v_product_id := p_item_id; end if;

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

  v_trade_price := v_sell.price;

  select coalesce(quantity, 0) into v_seller_pos
  from positions
  where user_id = v_sell.user_id and asset_id = p_item_id;

  if v_seller_pos is null or v_seller_pos < v_match_qty then
    raise exception 'INSUFFICIENT_SELLER_POSITION';
  end if;

  v_buy_total := public.fn_round_krw(v_trade_price * v_match_qty);
  v_sell_total := v_buy_total;

  insert into trades (order_id, user_id, product_id, price_at_trade, quantity, amount, type, fill_seq, subtotal_krw, fee_krw, total_krw)
  values (v_buy.id, v_buy.user_id, v_product_id, v_trade_price, v_match_qty, v_buy_total, 'BUY', 1, v_buy_total, 0, v_buy_total)
  returning id into v_trade_id_buy;

  insert into trades (order_id, user_id, product_id, price_at_trade, quantity, amount, type, fill_seq, subtotal_krw, fee_krw, total_krw)
  values (v_sell.id, v_sell.user_id, v_product_id, v_trade_price, v_match_qty, v_sell_total, 'SELL', 1, v_sell_total, 0, v_sell_total)
  returning id into v_trade_id_sell;

  insert into ledger_entries (user_id, order_id, trade_id, entry_type, currency, amount, asset_id, quantity, memo, metadata)
  values
    (v_buy.user_id, v_buy.id, v_trade_id_buy, 'CASH_DEBIT', 'KRW', -v_buy_total, null, 0, '매칭 매수', '{}'::jsonb),
    (v_buy.user_id, v_buy.id, v_trade_id_buy, 'ASSET_CREDIT', 'KRW', 0, p_item_id, v_match_qty, '매칭 매수', '{}'::jsonb);

  insert into ledger_entries (user_id, order_id, trade_id, entry_type, currency, amount, asset_id, quantity, memo, metadata)
  values
    (v_sell.user_id, v_sell.id, v_trade_id_sell, 'ASSET_DEBIT', 'KRW', 0, p_item_id, v_match_qty, '매칭 매도', '{}'::jsonb),
    (v_sell.user_id, v_sell.id, v_trade_id_sell, 'CASH_CREDIT', 'KRW', v_sell_total, null, 0, '매칭 매도', '{}'::jsonb);

  insert into audit_logs(user_id,action,ref_type,ref_id,metadata)
  values (v_buy.user_id,'TRADE_EXECUTED','trade',v_trade_id_buy,
          json_build_object('qty',v_match_qty,'price',v_trade_price));

  insert into audit_logs(user_id,action,ref_type,ref_id,metadata)
  values (v_sell.user_id,'TRADE_EXECUTED','trade',v_trade_id_sell,
          json_build_object('qty',v_match_qty,'price',v_trade_price));

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

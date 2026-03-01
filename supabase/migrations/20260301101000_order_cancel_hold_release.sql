-- orders에 hold(예약) 정보 컬럼 추가 (없으면)
alter table if exists orders
  add column if not exists locked_cash_krw numeric default 0,
  add column if not exists locked_asset_qty numeric default 0,
  add column if not exists canceled_at timestamptz;

-- ledger_entries: CASH_RELEASE, ASSET_RELEASE 사용 (fn_ledger_entry_type_check에 이미 포함됨)
-- HOLD/RELEASE 타입: CASH_HOLD, CASH_RELEASE, ASSET_HOLD, ASSET_RELEASE

-- 주문 취소 RPC (원자화 + lock + release)
create or replace function public.rpc_cancel_order_atomic(
  p_user_id uuid,
  p_order_id uuid
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item_id uuid;
  v_side text;
  v_status text;
  v_remaining numeric;
  v_locked_cash numeric;
  v_locked_asset numeric;

  v_lock_key bigint;

  v_release_cash numeric := 0;
  v_release_asset numeric := 0;

  v_after_locked_cash numeric;
  v_after_locked_asset numeric;
begin
  -- 주문 조회 및 잠금(행 잠금)
  -- orders: content_id=item, type=BUY/SELL
  select content_id, lower(type), status, remaining_qty, coalesce(locked_cash_krw,0), coalesce(locked_asset_qty,0)
    into v_item_id, v_side, v_status, v_remaining, v_locked_cash, v_locked_asset
  from orders
  where id = p_order_id and user_id = p_user_id
  for update;

  if v_item_id is null then
    raise exception 'ORDER_NOT_FOUND';
  end if;

  if v_status in ('filled','canceled') then
    return json_build_object('ok', true, 'already_final', true, 'status', v_status, 'order_id', p_order_id);
  end if;

  if v_status not in ('placed','partial') then
    raise exception 'INVALID_ORDER_STATUS';
  end if;

  if v_remaining is null or v_remaining <= 0 then
    -- 남은게 없으면 filled로 간주될 수 있으니 안전 처리
    update orders set status='filled' where id=p_order_id;
    return json_build_object('ok', true, 'status', 'filled', 'order_id', p_order_id);
  end if;

  -- advisory lock (user,item) 단위
  v_lock_key := hashtextextended(p_user_id::text || ':' || v_item_id::text, 0);
  perform pg_advisory_xact_lock(v_lock_key);

  -- RELEASE 계산:
  -- BUY 미체결분: locked_cash_krw 해제
  -- SELL 미체결분: locked_asset_qty 해제
  if v_side = 'buy' then
    v_release_cash := v_locked_cash;
    v_release_asset := 0;
  else
    v_release_asset := v_locked_asset;
    v_release_cash := 0;
  end if;

  -- 주문 취소 + hold 0으로 정리
  update orders
  set status='canceled',
      canceled_at=now(),
      locked_cash_krw=0,
      locked_asset_qty=0
  where id = p_order_id;

  -- 원장 기록 (릴리즈) - ledger_entries: user_id, order_id, entry_type, currency, amount, asset_id, quantity
  if v_release_cash > 0 then
    insert into ledger_entries (user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata)
    values (p_user_id, p_order_id, 'CASH_RELEASE', 'KRW', v_release_cash, null, 0, '주문 취소 HOLD 해제', '{}'::jsonb);
  end if;

  if v_release_asset > 0 then
    insert into ledger_entries (user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata)
    values (p_user_id, p_order_id, 'ASSET_RELEASE', 'KRW', 0, v_item_id, v_release_asset, '주문 취소 HOLD 해제', '{}'::jsonb);
  end if;

  -- 검증: orders에 hold가 0인지 확인
  select coalesce(locked_cash_krw,0), coalesce(locked_asset_qty,0)
    into v_after_locked_cash, v_after_locked_asset
  from orders
  where id = p_order_id;

  if v_after_locked_cash <> 0 or v_after_locked_asset <> 0 then
    raise exception 'CANCEL_RELEASE_MISMATCH';
  end if;

  return json_build_object(
    'ok', true,
    'order_id', p_order_id,
    'status', 'canceled',
    'released', json_build_object('cash_krw', v_release_cash, 'asset_qty', v_release_asset)
  );
end;
$$;

grant execute on function public.rpc_cancel_order_atomic(uuid,uuid) to authenticated;
grant execute on function public.rpc_cancel_order_atomic(uuid,uuid) to service_role;

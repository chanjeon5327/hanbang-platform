create or replace function transition_order_status(
  _order_id uuid,
  _next_status order_status
)
returns void
language plpgsql
security definer
as $$
declare
  current_status order_status;
begin
  select status into current_status
  from orders
  where id = _order_id;

  if current_status is null then
    raise exception 'ORDER_NOT_FOUND';
  end if;

  -- 허용 전이 규칙
  if current_status = 'pending' and _next_status = 'paid' then
    null;
  elsif current_status = 'paid' and _next_status in ('completed', 'cancelled') then
    null;
  elsif current_status = 'completed' and _next_status = 'refunded' then
    null;
  else
    raise exception 'INVALID_STATUS_TRANSITION: % -> %',
      current_status, _next_status;
  end if;

  update orders
  set status = _next_status
  where id = _order_id;
end;
$$;

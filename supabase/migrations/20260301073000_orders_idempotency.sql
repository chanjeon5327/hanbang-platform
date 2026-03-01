-- 주문 멱등키 컬럼 추가
alter table if exists orders
add column if not exists idempotency_key text;

-- (user_id, idempotency_key) 유니크로 중복주문 방지
create unique index if not exists ux_orders_user_idempotency
on orders(user_id, idempotency_key)
where idempotency_key is not null;

-- 조회 성능
create index if not exists idx_orders_user_id_created_at
on orders(user_id, created_at desc);

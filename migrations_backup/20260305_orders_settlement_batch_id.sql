-- orders.settlement_batch_id 추가 (rpc_admin_confirm_settlement, 정산 배치 연결용)
alter table public.orders
add column if not exists settlement_batch_id uuid;

alter table public.orders
drop constraint if exists fk_orders_settlement_batch;

alter table public.orders
add constraint fk_orders_settlement_batch
foreign key (settlement_batch_id)
references public.settlement_batches(id);

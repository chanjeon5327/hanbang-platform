alter table settlement_batches
add column if not exists seller_id uuid;

alter table settlement_batches
add column if not exists status text default 'pending';

alter table settlement_batches
add column if not exists settled_at timestamptz;

create index if not exists idx_settlement_batches_seller_date
on settlement_batches (seller_id, settlement_date);

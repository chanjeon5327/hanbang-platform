-- users (이미 존재 가정)
-- id uuid PK

-- products
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  price numeric not null,
  created_at timestamptz default now()
);

create index if not exists idx_products_seller_id on products(seller_id);

-- orders
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references products(id) on delete restrict,
  amount numeric not null,
  status text not null default 'pending',
  created_at timestamptz default now()
);

create index if not exists idx_orders_buyer_id on orders(buyer_id);
create index if not exists idx_orders_product_id on orders(product_id);

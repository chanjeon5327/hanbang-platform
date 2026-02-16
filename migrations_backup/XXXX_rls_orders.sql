alter table orders enable row level security;

-- 구매자: 본인 주문만
create policy "buyer can view own orders"
on orders
for select
using (
  buyer_id = auth.uid()
);

-- 판매자: 본인 상품에 대한 주문만 (via products)
create policy "seller can view orders of own products"
on orders
for select
using (
  exists (
    select 1
    from products p
    where p.id = orders.product_id
      and p.seller_id = auth.uid()
  )
);

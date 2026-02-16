create or replace view orders_with_seller as
select
  o.id as order_id,
  o.buyer_id,
  p.seller_id,
  o.product_id,
  o.amount,
  o.status,
  o.created_at
from orders o
join products p on p.id = o.product_id;

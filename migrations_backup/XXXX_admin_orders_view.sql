create or replace view admin_orders_full as
select
  o.id as order_id,
  o.created_at,
  o.status,
  o.amount,
  o.buyer_id,
  bu.email as buyer_email,
  p.id as product_id,
  p.title as product_title,
  p.seller_id,
  su.email as seller_email
from orders o
join products p on p.id = o.product_id
join auth.users bu on bu.id = o.buyer_id
join auth.users su on su.id = p.seller_id;

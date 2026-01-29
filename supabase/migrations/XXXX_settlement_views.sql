-- 판매자별 일자/월자 매출 집계 View
create or replace view seller_settlement_daily as
select
  p.seller_id,
  date_trunc('day', o.created_at) as day,
  sum(o.amount) as gross_amount,
  count(*) as order_count
from orders o
join products p on p.id = o.product_id
where o.status = 'completed'
group by p.seller_id, date_trunc('day', o.created_at);

create or replace view seller_settlement_monthly as
select
  p.seller_id,
  date_trunc('month', o.created_at) as month,
  sum(o.amount) as gross_amount,
  count(*) as order_count
from orders o
join products p on p.id = o.product_id
where o.status = 'completed'
group by p.seller_id, date_trunc('month', o.created_at);

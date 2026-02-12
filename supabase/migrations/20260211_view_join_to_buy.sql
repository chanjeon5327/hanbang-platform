create or replace view public.v_join_to_buy_7d as
select
  ci.id as content_id,
  count(distinct jf.user_id) as joins_7d,
  count(distinct o.user_id) as buyers_7d,
  case
    when count(distinct jf.user_id) = 0 then 0
    else round(count(distinct o.user_id)::numeric
      / count(distinct jf.user_id), 4)
  end as conversion_rate_7d
from public.content_items ci
left join public.join_funnel jf
  on jf.content_id = ci.id
 and jf.created_at >= now() - interval '7 day'
left join public.orders o
  on o.content_id = ci.id
 and o.created_at >= now() - interval '7 day'
group by ci.id;

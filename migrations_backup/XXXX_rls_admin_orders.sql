alter view admin_orders_full set (security_barrier = true);

-- 관리자만 전체 조회
create policy "admin can view all orders"
on admin_orders_full
for select
using (
  exists (
    select 1
    from public.user_roles r
    where r.user_id = auth.uid()
      and r.role = 'admin'
  )
);

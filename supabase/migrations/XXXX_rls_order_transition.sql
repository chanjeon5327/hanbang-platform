-- orders UPDATE 제한
create policy "only system or admin can change order status"
on orders
for update
using (
  exists (
    select 1
    from public.user_roles r
    where r.user_id = auth.uid()
      and r.role in ('admin', 'system')
  )
);

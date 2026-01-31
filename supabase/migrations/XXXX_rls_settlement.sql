alter view seller_settlement_daily set (security_barrier = true);
alter view seller_settlement_monthly set (security_barrier = true);

-- 판매자 본인만 조회
create policy "seller can view own settlement daily"
on seller_settlement_daily
for select
using (seller_id = auth.uid());

create policy "seller can view own settlement monthly"
on seller_settlement_monthly
for select
using (seller_id = auth.uid());

-- 로그인 유저로 주문 생성 (product_id: placeholder UUID)
insert into orders (buyer_id, product_id, total_amount_krw, quantity)
values (auth.uid(), '00000000-0000-0000-0000-000000000001'::uuid, 100000, 1);

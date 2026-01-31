-- 로그인 유저로 주문 생성
insert into orders (buyer_id, product_id, total_amount_krw, quantity)
values (auth.uid(), '임의-product-id', 100000, 1);

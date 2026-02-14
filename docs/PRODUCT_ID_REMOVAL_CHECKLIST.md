# product_id 제거 가능 시점 체크리스트

## 전제

- `content_id` 듀얼 운영 완료
- 모든 신규 주문이 `content_id` 저장
- 기존 `product_id` 데이터 backfill 완료

## 제거 전 확인 사항

- [ ] `orders.content_id` NOT NULL 전환 (기존 row 모두 backfill)
- [ ] API/프론트가 `content_id`만 사용
- [ ] `rpc_invest_and_notify` `p_product_id` 오버로드 제거
- [ ] `product_chat_messages.product_id` → `content_id` 컬럼명 변경 (선택)
- [ ] `ledger_entries.asset_id` 의미가 content_id로 통일됨
- [ ] `v_join_to_buy_7d` 등 뷰가 `content_id`만 참조
- [ ] `orders.product_id` FK 제거
- [ ] `idx_orders_product_id` 인덱스 제거

## 제거 순서 (예시)

1. `orders.content_id` NOT NULL alter
2. 모든 쿼리/뷰/RPC에서 `product_id` 참조 제거
3. `orders.product_id` 컬럼 drop
4. `product_chat_messages.product_id` → `content_id` rename (선택 시)

## 주의

- **product_id는 당장 제거하지 않는다**
- 듀얼 운영 → 코드 완전 전환 → 마지막에 제거

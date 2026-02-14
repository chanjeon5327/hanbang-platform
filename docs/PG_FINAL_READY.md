# PG(페이먼트 게이트웨이) 실전 대비 최종 문서

## 1. orders.status ENUM 점검

| 현재 값 | PG 권장 | 비고 |
|---------|---------|------|
| PENDING | PENDING | 결제 대기 |
| PAID | PAID | 결제 완료 |
| COMPLETED | CONFIRMED | 주문 확정 (마켓 투자는 즉시 COMPLETED) |
| SETTLED | SETTLED | 정산 완료 |

※ 마켓 투자 플로우는 PENDING/PAID 단계 없이 즉시 COMPLETED. 기존 ENUM 유지.

## 2. idempotency_key

- `orders.idempotency_key` text, unique (null 제외)
- 클라이언트가 동일 결제 요청 시 동일 키 전달 → 중복 주문 방지
- `rpc_invest_and_notify(p_idempotency_key)` 지원

## 3. Double-Spend 방지 구조

1. **잔액 검증**: 투자 전 ledger 합산
2. **원자적 RPC**: order + ledger + content_items + notifications 단일 트랜잭션
3. **idempotency_key**: 동일 요청 재전송 시 기존 주문 반환
4. **ledger CASH_DEBIT 중복 체크**: order_id당 1회만

## 4. content_id 중심 구조

- 마켓 기준 ID = content_items.id
- orders.content_id, ledger asset_id, notifications reference_id 모두 content_id
- product_id는 듀얼 운영, 추후 제거

## 5. 마이그레이션 실행 순서

1. `20260215_products_content_id.sql`
2. `20260215_orders_content_id_dual.sql`
3. `20260215_orders_pg_ready.sql`
4. `20260215_rpc_invest_and_notify_content_id.sql`

# products.id / market[id] 타입 기준 확정

## 1. 타입 기준 표

| 항목 | DB/스키마 타입 | lib/supabase types | 현재 사용 | 결론 |
|------|----------------|-------------------|-----------|------|
| **products.id** | `uuid` (PK) | `string` | products 테이블 PK | **UUID** |
| **orders.product_id** | `uuid` NOT NULL, FK→products(id) | `string` | 주문 시 product 참조 | **UUID** |
| **market[id]** (route param) | - | `string` | content_items.id 또는 fallback id | **UUID** (API: content_items.uuid, fallback: UUID로 통일) |
| **chat.product_id** | `uuid` NOT NULL (product_chat_messages) | - | 채팅 메시지의 상품 식별 | **UUID** |
| **user_interests** | `content_id` uuid, FK→content_items(id) | `string` | content_items 참조 (product_id 아님) | **UUID** (content_id) |

## 2. 결론

- **기준: UUID**
- DB 스키마(products, orders, product_chat_messages)는 모두 `uuid` 사용
- `sample-1`, `sample-2` 등 문자열 id는 **제거**하고, fallback/더미 데이터는 **유효한 UUID**로 교체

## 3. 참고: content_items vs products

- `content_items`: 홈 레일/추천용 (id: uuid)
- `products`: 주문/거래/채팅용 (id: uuid)
- market 페이지: API 시 content_items.id 사용, fallback 시 더미 UUID 사용
- 채팅/주문: `products.id` 기대 (product_chat_messages, rpc_place_order)

## 4. 수정 내역 (적용됨)

| 경로 | 변경 내용 |
|------|-----------|
| `lib/constants/fallbackIds.ts` | 신규: FALLBACK_IDS 상수 (UUID 10개) |
| `app/market/page.tsx` | FALLBACK_ITEMS id → FALLBACK_IDS 사용 |
| `app/api/home/sponsored/route.ts` | MOCK_SPONSORED productId → FALLBACK_IDS.SAMPLE_1 |
| `hooks/useSponsoredPick.ts` | MOCK_FALLBACK productId → FALLBACK_IDS.SAMPLE_1 |
| `hooks/useRecommendedRails.ts` | FALLBACK_RAILS id → FALLBACK_IDS 사용 |
| `app/notifications/page.tsx` | reference_id → UUID |
| `components/notifications/NotificationBell.tsx` | reference_id → UUID |
| `app/admin/chat/moderation/page.tsx` | marketId → UUID |
| `app/api/chat/[productId]/route.ts` | productId UUID 검증 추가 (400 반환) |

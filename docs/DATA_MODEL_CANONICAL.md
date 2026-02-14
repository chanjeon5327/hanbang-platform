# 데이터 모델 정전(Canonical) 구조

## 마켓 기준 ID: content_items.id (UUID)

모든 마켓/콘텐츠 관련 참조는 `content_items.id`를 기준으로 한다.

## ER 구조 (ASCII)

```
┌─────────────────────┐
│   content_items     │
│   (콘텐츠 마스터)    │
├─────────────────────┤
│ id uuid PK          │◄──────────────────────────────────────┐
│ title, summary      │                                        │
│ creator_name        │                                        │
│ total_raise         │                                        │
│ current_raise       │                                        │
│ yield_rate          │                                        │
│ deadline            │                                        │
└──────────┬──────────┘                                        │
           │                                                    │
           │ 1:1 (판매 설정)                                    │
           ▼                                                    │
┌─────────────────────┐                                        │
│     products        │                                        │
│ (판매/정산 설정 전용) │                                        │
├─────────────────────┤                                        │
│ id uuid PK          │                                        │
│ content_id uuid FK  │────────────────────────────────────────┘
│ seller_id           │
│ price               │
│ remaining_quantity  │
└──────────┬──────────┘
           │
           │ (레거시 참조)
           ▼
┌─────────────────────┐     ┌─────────────────────┐
│      orders         │     │  product_chat_      │
│                     │     │  messages           │
├─────────────────────┤     ├─────────────────────┤
│ id uuid PK          │     │ product_id uuid     │──────┐
│ user_id             │     │ (content_id 의미)   │      │
│ content_id uuid FK  │─────┼─────────────────────┤      │
│ product_id uuid FK  │     │ user_id, message    │      │
│ (듀얼, 추후 제거)   │     └─────────────────────┘      │
│ total_amount_krw    │                                   │
│ status              │     ┌─────────────────────┐      │
│ idempotency_key     │     │   user_interests     │      │
└─────────────────────┘     ├─────────────────────┤      │
           │                │ content_id uuid FK  │──────┘
           │                └─────────────────────┘
           ▼
┌─────────────────────┐     ┌─────────────────────┐
│  ledger_entries     │     │   notifications     │
├─────────────────────┤     ├─────────────────────┤
│ asset_id uuid       │     │ reference_id uuid   │
│ (content_id 의미)   │     │ (content_id 의미)   │
└─────────────────────┘     └─────────────────────┘
```

## 테이블 역할

| 테이블 | 역할 |
|--------|------|
| **content_items** | 콘텐츠 마스터. 마켓 노출, 모집률, 수익률 등 |
| **products** | 판매 설정/정산 설정. content_id로 content_items 참조 |
| **orders** | 주문. content_id 기준, product_id 듀얼 유지 |
| **product_chat_messages** | 채팅. product_id 컬럼명이나 content_id 의미 |
| **user_interests** | 관심. content_id |
| **ledger_entries** | 원장. asset_id = content_id |
| **notifications** | 알림. reference_id = content_id |

## products.content_id 규칙

- `products.content_id` → `content_items(id)` FK, NOT NULL
- products는 content_items 1:1 (판매 가능 콘텐츠당 1 products row)
- 투자 시 content_id 기준으로 처리, product_id는 products 존재 시 병행 저장

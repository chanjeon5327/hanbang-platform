# Order 상태 전이 머신 (PG 결제 플로우)

## 6단계 ENUM

| 상태 | 설명 |
|------|------|
| **INIT** | 초기 생성 |
| **PAYMENT_REQUESTED** | 결제 요청됨 (PG redirect URL 발급) |
| **PAYMENT_APPROVED** | PG 승인 완료 |
| **INVEST_CONFIRMED** | 투자 확정 (ledger + content_items + notifications) |
| **SETTLED** | 정산 완료 |
| **CANCELLED** | 취소/실패/환불 |

## 상태 전이 다이어그램

```
                    ┌─────────┐
                    │  INIT   │
                    └────┬────┘
                         │ POST /api/payments/request
                         ▼
              ┌──────────────────────┐
              │  PAYMENT_REQUESTED    │
              └────┬────────────┬─────┘
                   │            │
     PG 승인        │            │ 취소/실패
                   ▼            ▼
         ┌─────────────────┐  ┌───────────┐
         │ PAYMENT_APPROVED │  │ CANCELLED │
         └────────┬────────┘  └───────────┘
                  │ rpc_invest_and_notify
                  ▼
         ┌─────────────────┐
         │ INVEST_CONFIRMED │
         └────────┬────────┘
                  │ 정산
                  ▼
         ┌─────────────────┐
         │     SETTLED      │
         └─────────────────┘
```

## 허용 전이

| from | to |
|------|-----|
| INIT | PAYMENT_REQUESTED, CANCELLED |
| PAYMENT_REQUESTED | PAYMENT_APPROVED, CANCELLED |
| PAYMENT_APPROVED | INVEST_CONFIRMED, CANCELLED |
| INVEST_CONFIRMED | SETTLED, CANCELLED |
| SETTLED | (종료) |
| CANCELLED | (종료) |

## 기존 status 매핑

| 기존 | 신규 |
|------|------|
| created, INIT | INIT |
| pending, PENDING | PAYMENT_REQUESTED |
| paid, PAID | PAYMENT_APPROVED |
| completed, COMPLETED | INVEST_CONFIRMED |
| settled, SETTLED | SETTLED |
| cancelled, failed, refunded | CANCELLED |

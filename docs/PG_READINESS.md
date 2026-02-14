# PG(페이먼트 게이트웨이) 대비 문서

## 1. 원장 불변성 (Ledger Immutability)

- **ledger_entries**는 금융 원장으로, 한 번 기록된 데이터는 수정/삭제 불가
- **권한**: anon/authenticated → INSERT/UPDATE/DELETE 완전 금지
- **읽기**: authenticated만 SELECT 가능, RLS로 본인 row만 조회
- **쓰기**: service_role 또는 SECURITY DEFINER RPC만 가능
- 참고: `supabase/migrations/20260222_ledger_entries_immutability.sql`

## 2. 정산 가드 구조 (Settlement Guard)

- **app.allow_settlement** 플래그: RPC 내부에서만 `set_config('app.allow_settlement','on',true)` 설정
- **트리거**: orders, settlement_batches UPDATE 시 플래그 검증
- 플래그 없이 UPDATE 시도 → `SETTLEMENT_UPDATE_FORBIDDEN` 예외
- 참고: `supabase/migrations/20260224_settlement_update_guard.sql`

## 3. Settlement 흐름도

```
[주문 생성] → PENDING
     ↓
[rpc_confirm_payment] → PAID (결제 확정)
     ↓
[rpc_finalize_order] → COMPLETED (원장 반영: CASH_DEBIT, ASSET_CREDIT)
     ↓
[정산 배치 생성] → settlement_batches
     ↓
[rpc_admin_confirm_settlement] → confirmed_at 설정
     ↓
[정산 완료] → CASH_CREDIT (투자자 입금)
```

## 4. Order 상태 전이 다이어그램

```
                    ┌─────────────┐
                    │   PENDING   │
                    └──────┬──────┘
                           │ rpc_confirm_payment
                           ▼
                    ┌─────────────┐
                    │    PAID     │
                    └──────┬──────┘
                           │ rpc_finalize_order
              ┌────────────┼────────────┐
              ▼            ▼            ▼
       ┌──────────┐  ┌──────────┐  ┌──────────┐
       │COMPLETED │  │CANCELLED │  │  FAILED  │
       └────┬─────┘  └──────────┘  └──────────┘
            │
            │ 정산
            ▼
       ┌──────────┐
       │ SETTLED  │
       └──────────┘
```

## 5. Double Spend 방지 구조

1. **잔액 검증**: 투자 전 ledger_entries 합산으로 잔액 계산
2. **원자적 처리**: `rpc_invest_and_notify`에서 order + ledger + content_items + notification을 단일 트랜잭션으로 처리
3. **중복 방지**: ledger CASH_DEBIT은 order_id당 1회만 (idempotent 체크)
4. **RLS**: ledger_entries는 클라이언트 직접 쓰기 불가

## 6. RLS 정책 정리

| 테이블 | SELECT | INSERT | UPDATE | DELETE |
|--------|--------|--------|--------|--------|
| ledger_entries | 본인만 (user_id) | RPC만 | 금지 | 금지 |
| orders | 본인 주문만 | RPC만 | RPC만 (플래그) | 금지 |
| notifications | 본인만 | 본인만 | 본인만 | - |
| settlement_batches | - | - | RPC만 (플래그) | - |
| product_chat_messages | 모두 (is_deleted=false) | 본인 | 본인/ADMIN | - |
| profanity_words | 활성만 | - | - | - |

## 7. 투자 플로우 (rpc_invest_and_notify)

```
[프론트] POST /api/orders/place { product_id, amount }
    ↓
[API] 잔액 검증 → rpc_invest_and_notify 호출
    ↓
[RPC] 1) orders INSERT (COMPLETED)
      2) ledger_entries INSERT (CASH_DEBIT, ASSET_CREDIT)
      3) content_items.current_raise += amount
      4) notifications INSERT
    ↓
[프론트] invest-success 이벤트 → InvestorDashboardCard refetch
```

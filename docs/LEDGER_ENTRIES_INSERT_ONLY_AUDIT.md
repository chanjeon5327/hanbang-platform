# ledger_entries Insert-Only 구조 점검 산출물

## 1. 검색 결과 파일 목록

### 1.1 ledger_entries 직접 접근

| 파일 | 패턴 | 용도 | 위험 |
|------|------|------|------|
| `app/api/orders/place/route.ts` | `.from("ledger_entries")` | SELECT (잔액 계산) | 안전 |
| `app/api/wallet/ledger/route.ts` | `.from('ledger_entries')` | SELECT | 안전 |
| `app/admin/orders/[order_id]/page.tsx` | `.from('ledger_entries')` | SELECT | 안전 |
| `e2e/e2e-payment-flow.spec.ts` | `.from('ledger_entries')` | SELECT (테스트) | 안전 |
| `scripts/e2e-payment-flow.mjs` | `.from('ledger_entries')` | SELECT (테스트) | 안전 |
| `lib/supabase/types.ts` | `ledger_entries` | 타입 정의 | - |

### 1.2 ledger_entries INSERT/UPDATE/DELETE (앱 코드)

| 파일 | 상태 |
|------|------|
| (없음) | **직접 INSERT/UPDATE/DELETE 제거 완료** |

### 1.3 service_role / createAdminClient 사용

| 파일 | 용도 |
|------|------|
| `lib/supabase/admin.ts` | supabaseAdmin 생성 |
| `utils/supabase/server.ts` | createAdminClient() |
| `app/api/orders/place/route.ts` | orders INSERT |
| `app/api/payments/confirm/route.ts` | rpc_confirm_payment, rpc_finalize_order, payments INSERT |
| `app/api/admin/audit/route.ts` | admin_audit_logs INSERT |
| `app/api/admin/kpi/join-to-buy/route.ts` | KPI 조회 |
| `app/api/chat/route.ts` | SERVICE_KEY (채팅) |
| `app/api/market/tick/route.ts` | SERVICE_KEY (시세) |
| `e2e/e2e-payment-flow.spec.ts` | 테스트용 ledger 조회 |
| `scripts/e2e-payment-flow.mjs` | 테스트용 ledger 조회 |
| `scripts/reset-test-password.mjs` | 테스트 비밀번호 리셋 |

---

## 2. 수정된 파일 통코

### 2.1 신규: `supabase/migrations/20260225_rpc_post_ledger_for_order.sql`

```sql
-- ledger_entries INSERT 전용 RPC (place route 등에서 사용)
-- SECURITY DEFINER로 service_role 없이 호출 가능

CREATE OR REPLACE FUNCTION public.rpc_post_ledger_for_order(
  p_order_id uuid,
  p_user_id uuid,
  p_amount_krw numeric,
  p_product_id uuid DEFAULT NULL,
  p_quantity numeric DEFAULT 1
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'FORBIDDEN: 본인 주문만 원장 반영 가능';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM orders o
    WHERE o.id = p_order_id AND o.user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'ORDER_NOT_FOUND_OR_FORBIDDEN';
  END IF;

  IF EXISTS (SELECT 1 FROM ledger_entries WHERE order_id = p_order_id AND entry_type = 'CASH_DEBIT') THEN
    RETURN jsonb_build_object('ok', true, 'idempotent', true);
  END IF;

  INSERT INTO ledger_entries (user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata)
  VALUES (p_user_id, p_order_id, 'CASH_DEBIT', 'KRW', (p_amount_krw * -1), NULL, 0, 'PRODUCT_PURCHASE', '{}'::jsonb);

  IF p_product_id IS NOT NULL AND p_quantity > 0 THEN
    INSERT INTO ledger_entries (user_id, order_id, entry_type, currency, amount, asset_id, quantity, memo, metadata)
    VALUES (p_user_id, p_order_id, 'ASSET_CREDIT', 'KRW', 0, p_product_id, p_quantity, 'PRODUCT_PURCHASE', '{}'::jsonb);
  END IF;

  RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_post_ledger_for_order(uuid, uuid, numeric, uuid, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_post_ledger_for_order(uuid, uuid, numeric, uuid, numeric) TO service_role;
```

### 2.2 수정: `app/api/orders/place/route.ts`

```typescript
// 변경 전: admin.from("ledger_entries").insert(ledgerPayload)
// 변경 후: supabase.rpc("rpc_post_ledger_for_order", {...})

    const { error: ledgerError } = await supabase.rpc("rpc_post_ledger_for_order", {
      p_order_id: order.id,
      p_user_id: user.id,
      p_amount_krw: amountPositive,
      p_product_id: product_id.trim(),
      p_quantity: 1,
    });

    if (ledgerError) {
      return NextResponse.json(
        { error: "LEDGER_INSERT_FAILED", debug: ledgerError.message },
        { status: 500 }
      );
    }
```

---

## 3. 최종 구조 다이어그램

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ ledger_entries INSERT 경로 (오직 아래 3가지)                                      │
└─────────────────────────────────────────────────────────────────────────────────┘

[1] PG 결제 플로우 (payments/confirm)
    PG 콜백 → POST /api/payments/confirm
      → supabaseAdmin (service_role)
      → rpc_confirm_payment (PAID)
      → rpc_finalize_order (COMPLETED + ledger 2건 INSERT)
        → SECURITY DEFINER, service_role 호출

[2] place 플로우 (잔액 결제)
    POST /api/orders/place
      → createClient (authenticated) → ledger SELECT (잔액 확인)
      → createAdminClient → orders INSERT
      → createClient.rpc("rpc_post_ledger_for_order") → ledger 2건 INSERT
        → SECURITY DEFINER, auth.uid() 검증

[3] rpc_invest (레거시 모바일)
    MobileProductDetail → supabase.rpc("rpc_invest", { p_product_id })
      → SECURITY DEFINER RPC
      → orders INSERT + ledger 2건 INSERT (내부)

┌─────────────────────────────────────────────────────────────────────────────────┐
│ ledger_entries SELECT 경로 (RLS 적용)                                             │
└─────────────────────────────────────────────────────────────────────────────────┘

[조회] GET /api/wallet/ledger → createClient().from('ledger_entries').select() → RLS
[조회] admin/orders/[id] → createClient().from('ledger_entries').select() → RLS (admin policy)
[조회] place route → createClient().from('ledger_entries').select() → 잔액 계산

┌─────────────────────────────────────────────────────────────────────────────────┐
│ ledger_entries INSERT/UPDATE/DELETE 직접 접근                                     │
└─────────────────────────────────────────────────────────────────────────────────┘

[금지] .from('ledger_entries').insert/update/delete → 앱 코드에서 0건
[권한] 20260222_ledger_entries_immutability.sql: anon, authenticated에 INSERT/UPDATE/DELETE REVOKE
```

---

## 4. service_role 사용 최소화 점검

| 파일 | 필요 여부 | 비고 |
|------|-----------|------|
| `app/api/orders/place/route.ts` | 필요 | orders INSERT (RLS 우회) |
| `app/api/payments/confirm/route.ts` | 필요 | PG 콜백, payments, orders, RPC 호출 |
| `app/api/admin/audit/route.ts` | 필요 | admin_audit_logs INSERT |
| `app/api/admin/kpi/join-to-buy/route.ts` | 검토 | KPI 조회만이면 anon/authenticated 가능할 수 있음 |
| `app/api/chat/route.ts` | 검토 | 채팅용 - 필요 시 유지 |
| `app/api/market/tick/route.ts` | 검토 | 시세용 - 필요 시 유지 |
| `e2e/*`, `scripts/*` | 테스트 | 서버/로컬 전용, 노출 주의 |

**위험 패턴**: 없음. ledger_entries 직접 INSERT는 모두 제거됨.

---

## 5. 완료 체크리스트 (8개)

- [x] 1. `ledger_entries` 직접 INSERT/UPDATE/DELETE 앱 코드 검색 → 0건
- [x] 2. `rpc_post_ledger_for_order` RPC 생성 (SECURITY DEFINER, 멱등, auth 검증)
- [x] 3. `app/api/orders/place/route.ts` ledger INSERT → RPC 호출로 교체
- [x] 4. ledger SELECT만 사용하는 곳 확인 (wallet/ledger, admin/orders, place 잔액)
- [x] 5. service_role 사용 위치 목록화 및 검토
- [x] 6. 최종 구조 다이어그램 작성
- [x] 7. 수정 파일 통코 산출
- [x] 8. 20260222_ledger_entries_immutability.sql 기반 권한 정책 유지 (anon/authenticated INSERT/UPDATE/DELETE REVOKE)

---

## 6. 추가 참고

- **rpc_invest**: `supabase/rpc/rpc_invest.sql` - SECURITY DEFINER, ledger INSERT 내부. 클라이언트에서 호출. migration에 미포함 시 별도 적용 필요.
- **rpc_finalize_order**: `supabase/migrations/20260224_settlement_update_guard.sql` 등 - SECURITY DEFINER, ledger INSERT. payments/confirm에서만 호출.

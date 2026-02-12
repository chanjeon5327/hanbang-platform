# HANBANG Status Board

> Master Plan 기준 완료/진행/막힘/다음 현황

---

## 1) 스프린트 현황

| 스프린트 | 상태 | 완료 기준 | 비고 |
|----------|------|----------|------|
| **1) E2E 구매 플로우** | ✅ 완료 | 주문→결제스텁→검증→원장→성공→지갑 | place, stub, rpc_confirm_payment, ledger 트리거 |
| **2) 거래 상세 업비트형** | 🔄 진행 | 헤더/차트/호가/주문패널/스티키 | market/[id] 존재, 스티키 disabled→해제 완료 |
| **3) 마이페이지 완성** | ⏳ 대기 | 내 자산/주문/보유/원장/설정 | 하드코딩 데이터, orders/ledger 미연결 |
| **4) 판매자 출품/정산** | ⏳ 대기 | 출품/판매현황/정산 조회 | creator/dashboard, seller_settlement_* 뷰 |
| **5) 관리자 정산/감사** | 🔄 진행 | 배치 확정/불변/감사로그 | settlement UI 존재, rpc_admin_confirm_settlement 호출 |

---

## 2) 계층별 라벨

### ✅ 완료 (Done)
- E2E 구매: `/api/orders/place`, `/api/payment/stub`, `/api/webhook/payment` → `rpc_confirm_payment` → `tg_post_ledger_on_order_completed`
- 주문 성공: `/order/success` (데모 모드 포함)
- 지갑: `/wallet` 토스형+업비트형 UI, `/api/wallet/ledger` → ledger_entries
- 매수 버튼: `disabled={false}` (AB variant C 제한 해제)

### 🔄 진행 (In Progress)
- 거래 상세: `app/market/[id]/page.tsx`, OrderBook, MobileOrderPanel, MobilePriceChart
- 관리자 정산: `app/admin/settlement`, `rpc_admin_confirm_settlement` (RPC 존재 여부 확인 필요)

### ⏳ 대기 (Blocked/Pending)
- 마이페이지: `MyAssetSummary`, `MyInvestList`, `MyHistory` → orders/ledger 미연결
- 입출금: `/wallet/deposit`, `/wallet/withdraw` placeholder
- PG KCP 실제 연동

### 🚫 막힘 (Blocked)
- `rpc_admin_confirm_settlement`: migration 미확인, 404 가능
- `admin_audit_logs`: 문서만 언급, 스키마 없음
- `settlement_batches`: 뷰/테이블 존재 여부 확인 필요

---

## 3) 파일 경로 요약

| 구분 | 경로 |
|------|------|
| E2E 주문 | `app/api/orders/place/route.ts`, `app/api/orders/[id]/route.ts` |
| 결제 | `app/api/payment/stub/route.ts`, `app/api/webhook/payment/route.ts` |
| 원장 | `app/api/wallet/ledger/route.ts`, `supabase/migrations/202601290539_ledger.sql` |
| 마이페이지 | `app/mypage/page.tsx`, `components/mypage/*` |
| 관리자 | `app/admin/settlement/*`, `app/admin/orders/[order_id]/page.tsx` |
| 판매자 | `app/creator/dashboard/page.tsx`, `app/creator/register/page.tsx` |

---

## 4) 다음 액션

1. 마이페이지: `MyAssetSummary` / `MyInvestList` / `MyHistory` → `orders`, `ledger_entries` API 연동
2. 관리자: `rpc_admin_confirm_settlement` RPC 존재 확인 및 migration 보강
3. 정산: `settlement_batches` 테이블/뷰 스키마 확인

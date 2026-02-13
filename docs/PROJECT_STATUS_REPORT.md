# HANBANG 플랫폼 프로젝트 상태 리포트

> 외부 협업자 전달용 요약 (2025.02 기준)

---

## 1) 주요 페이지 라우트 (app/*)

### 공용
- `/` — `app/page.tsx` (홈)
- `/login` — `app/login/page.tsx`
- `/signup` — `app/signup/page.tsx`
- `/market` — `app/market/page.tsx` (마켓 목록)
- `/market/[id]` — `app/market/[id]/page.tsx` (마켓 상세, 청약/매수)
- `/wallet` — `app/wallet/page.tsx`
- `/wallet/deposit`, `/wallet/withdraw`, `/wallet/swap` — 입출금/스왑
- `/mypage` — `app/mypage/page.tsx`
- `/order/success` — `app/order/success/page.tsx` (결제 완료)
- `/order/pay` — `app/order/pay/page.tsx` (테스트 결제 시뮬레이션)
- `/order/return` — `app/order/return/page.tsx` (KCP 결제 후 리턴)

### 투자/프로젝트
- `/invest`, `/invest/[id]`, `/invest/list`, `/invest/product/[id]`
- `/projects/[id]`, `/projects/[id]/invest`
- `/active-invest`, `/active-invest/product`, `/active-invest/product/[id]`

### 기타
- `/interest/[id]`, `/creator/dashboard`, `/creator/register`, `/settings`, `/notice`, `/onboarding`, `/ranking`, `/closing-soon`, `/lobby`, `/demo`

### 관리자 (admin)
- `/admin` — 리포트 대시보드 — `app/admin/page.tsx`
- `/admin/login` — `app/admin/login/page.tsx`
- `/admin/users` — 유저 관리 — `app/admin/users/page.tsx`
- `/admin/content` — 작품 승인/강제삭제 — `app/admin/content/page.tsx`
- `/admin/orders` — 주문/결제 확인 — `app/admin/orders/page.tsx`
- `/admin/orders/[order_id]` — 주문 상세 — `app/admin/orders/[order_id]/page.tsx`
- `/admin/settlement` — 정산 목록 — `app/admin/settlement/page.tsx`
- `/admin/settlement/[id]` — 정산 확정 — `app/admin/settlement/[id]/page.tsx`
- `/admin/chat/moderation` — 채팅 모더레이션 — `app/admin/chat/moderation/page.tsx`
- `/admin/reports` — 신고 처리 — `app/admin/reports/page.tsx`
- `/admin/kpc` — KPC 포인트 지급 — `app/admin/kpc/page.tsx`
- `/admin/notice` — 공지사항 — `app/admin/notice/page.tsx`
- `/admin/settings`, `/admin/settings/admins` — 설정
- `/admin/funnel`, `/admin/home-config`, `/admin/rail-config`, `/admin/projects` — 운영 설정

---

## 2) 인증/세션 구조

### 사용자 인증 (메인 앱)
- **Provider**: `components/auth/AuthProvider.tsx` — `app/providers.tsx`에서 래핑
- **API**: `useAuth()` → `user`, `session`, `loading`, `signOut`, `openLoginModal`, `closeLoginModal`
- **로그아웃**: `components/auth/AuthProvider.tsx` 내 `signOut()` — Supabase `signOut()` 후 `/`로 이동
- **세션**: Supabase Auth 기반, `supabase.auth.getSession()`, `onAuthStateChange`

### 관리자 인증
- **Provider**: `context/AuthContext.tsx` — `app/admin/layout.tsx` 내부에서만 사용
- **API**: `useAuth()` → `adminUser`, `isAuthenticated`, `login`, `logout`, `hasPermission`
- **로그아웃**: `context/AuthContext.tsx` — `localStorage.removeItem("admin_auth")` 후 `/` 이동
- **인증 방식**: MASTER_ACCOUNT 하드코딩 + localStorage (`chanjeon5327@gmail.com`)

---

## 3) 결제/주문/원장 플로우

### RPC 목록
| RPC | 역할 | 호출 경로 |
|-----|------|-----------|
| `rpc_place_order` | 주문 생성, status=PENDING | `app/api/orders/place/route.ts` |
| `rpc_confirm_payment` | PENDING → PAID | `app/api/payments/confirm/route.ts`, `app/api/payment/stub/route.ts`, `app/api/webhook/payment/route.ts` |
| `rpc_finalize_order` | PAID → COMPLETED, 원장 반영 | `app/api/payments/confirm/route.ts` |
| `rpc_admin_confirm_settlement` | 정산 배치 확정 | `app/admin/settlement/[id]/page.tsx` (migration 미확인) |
| `rpc_increment_content_metric` | content 지표 증가 | `app/api/funnel/join/route.ts`, `app/api/metrics/event/route.ts` |
| `rpc_invest` | 모바일 투자 (레거시) | `components/mobile/MobileProductDetail.tsx` |
| `transition_order_status` | DB 전이 규칙 검증 | migration 내 정의, 앱에서 직접 호출은 드묾 |

### orders.status 전이
```
PENDING → PAID (rpc_confirm_payment)
PAID → COMPLETED (rpc_finalize_order, 원장 반영)
PENDING → CANCELLED
PAID → REFUNDED (관리자 환불)
COMPLETED → SETTLED, REFUNDED
```

### payments 테이블
- **경로**: `supabase/migrations/20260213_payment_flow_standard.sql`
- **컬럼**: `id`, `order_id`, `pg_transaction_id` (UNIQUE), `status` (payment_status), `amount`, `created_at`

### refunds 테이블
- **경로**: 동일 migration
- **컬럼**: `id`, `order_id`, `status` (refund_status), `amount`, `created_at`

### ledger_entries
- 멱등: `idx_ledger_order_entry` on `(order_id, entry_type)`

---

## 4) 채팅/알림

### 채팅
- **컴포넌트**: `components/market/MarketChatSection.tsx` — 마켓 상세에 배치
- **API**: `app/api/chat/route.ts` — GET/POST, `chat_messages_v2` 테이블 사용
- **DB**: `chat_messages_v2` (room_key, sender, text) — 구현됨. `market_chat_messages` 설계는 `docs/schema/chat_and_notifications.sql`에만 존재

### 알림
- **컴포넌트**: `components/notifications/NotificationBell.tsx` — 헤더에 배치
- **DB**: `docs/schema/chat_and_notifications.sql` 설계만 (notifications 테이블), `supabase/schema.sql`에 notifications 존재 시 부분 구현
- **현재**: MOCK_NOTIFICATIONS 더미 데이터 사용, `GET /api/notifications` 미구현

---

## 5) 관리자

### 주요 페이지
- `app/admin/layout.tsx` — 좌측 사이드바, RBAC 메뉴, 상단 관리자 표시
- 대시보드, 유저, 작품승인, 주문, 정산, 채팅모더레이션, 신고, KPC, 공지, 설정

### 감사 로그
- **테이블**: `admin_audit_logs` — `supabase/migrations/20260212_admin_audit_logs.sql`
- **API**: POST `app/api/admin/audit/route.ts` — `lib/admin/auditLog.ts`의 `logAdminAction()` 호출
- **기록 위치**:
  - `app/admin/content/page.tsx` — CONTENT_APPROVE, CONTENT_REJECT, CONTENT_FORCE_DELETE
  - `app/admin/settlement/[id]/page.tsx` — SETTLEMENT_CONFIRM
  - `app/admin/chat/moderation/page.tsx` — CHAT_DELETE, CHAT_USER_SUSPEND
  - `app/admin/reports/page.tsx` — REPORT_RESOLVE
  - `app/admin/kpc/page.tsx` — KPC_GRANT
  - `app/admin/notice/page.tsx` — NOTICE_CREATE

---

## 6) TODO (미완, 런칭 기준)

1. **rpc_admin_confirm_settlement** — migration 미확인, 정산 확정 RPC 존재 여부 확인 필요
2. **settlement_batches** — 테이블/뷰 스키마 확인 및 migration 보강
3. **market id ↔ product id 매핑** — `market/[id]`의 id가 content_items인지 products인지 명확화, rpc_place_order(product_id) 연동 검증
4. **KCP 실제 연동** — `KCP_TEST_MODE=false` 시 결제창 URL·인증·서명 검증 완성
5. **관리자 계정** — MASTER_ACCOUNT 하드코딩 제거, Supabase Auth 또는 별도 admin 테이블 기반 체계로 전환
6. **알림 API** — `GET /api/notifications` 구현, notifications 테이블와 연동
7. **채팅 신고/모더레이션 DB** — `market_chat_reports`, `market_chat_messages` 설계 → migration 적용
8. **RBAC users 테이블** — profiles에 `role`, `status` 컬럼 migration 미적용
9. **환불 플로우** — refunds 테이블 구조만 존재, RPC·API·UI 미구현
10. **content_items ↔ products** — 청약/매수 시 content_id vs product_id 역할 정리 및 마이그레이션

---

---

*문서 경로: docs/PROJECT_STATUS_REPORT.md*

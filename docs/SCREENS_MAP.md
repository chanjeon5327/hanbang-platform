# HANBANG Screens Map

> 화면별 CTA / 데이터 / 파일 경로

---

## 1) 투자자(유저) — 핵심 화면

### 메인/탐색 (`/`)

| 항목 | 내용 |
|------|------|
| **파일** | `app/page.tsx` |
| **액션** | 레일 스크롤, RailCard 클릭 → /market/:id, 지갑 버튼 → /wallet |
| **데이터** | `/api/home/rails` 또는 FALLBACK_RAILS |
| **컴포넌트** | HomeHero, CurationSection, InterestStrip, BottomNavigation |
| **완료 기준** | 클릭→상세 진입 빠름, 추천 이유 노출 가능 |

### 상세/거래 (`/market/[id]`)

| 항목 | 내용 |
|------|------|
| **파일** | `app/market/[id]/page.tsx` |
| **액션** | 매수/매도 탭, 지정가/시장가, 수량/비율, 주문 제출, 관심합류 |
| **데이터** | `lastPrice` 하드코딩, `/api/ab/assign-buy`, `/api/ab/assign-cohort`, `/api/funnel/join` |
| **컴포넌트** | MarketHeader, MobilePriceChart, OrderBookSummary, OrderBookPanel, MobileOrderStickyBar, MobileOrderPanel, JoinFunnelButton |
| **완료 기준** | 차트→호가→주문 흐름 끊기지 않음 |

### 결제/성공 (`/order/success`)

| 항목 | 내용 |
|------|------|
| **파일** | `app/order/success/page.tsx` |
| **액션** | 주문 정보 확인, 내 지갑 보기 → /wallet, 홈으로 → / |
| **데이터** | `/api/orders/[id]`, order_id=demo 시 데모 데이터 |
| **완료 기준** | 주문 상태 전이 + 원장 기록 확인 가능 |

### 지갑 (`/wallet`)

| 항목 | 내용 |
|------|------|
| **파일** | `app/wallet/page.tsx` |
| **액션** | 입금 → /wallet/deposit, 출금 → /wallet/withdraw, 보유 상품 매도 |
| **데이터** | useStore (userCash, holdings, history), `/api/wallet/ledger` |
| **완료 기준** | 총 자산/원장 내역 즉시 표시 |

### 마이페이지 (`/mypage`)

| 항목 | 내용 |
|------|------|
| **파일** | `app/mypage/page.tsx` |
| **액션** | 주문 내역/정산 내역/입출금 기록 링크 (현재 클릭만) |
| **데이터** | **하드코딩** — MyAssetSummary, MyInvestList, MyHistory 모두 목업 |
| **컴포넌트** | MyPageLayout, MyAssetSummary, MyInvestList, MyHistory |
| **완료 기준** | orders/ledger 연동 후 "내가 뭘 샀고, 돈이 어떻게 변했는지" 한눈에 이해 |

---

## 2) 판매자(크리에이터)

### 출품/상품관리 (`/creator/dashboard`, `/creator/register`)

| 항목 | 내용 |
|------|------|
| **파일** | `app/creator/dashboard/page.tsx`, `app/creator/register/page.tsx` |
| **액션** | 새 프로젝트 등록, 상세보기, 수정하기 |
| **데이터** | localStorage `creator_submitted_projects` |
| **완료 기준** | 판매 현황/정산 예정액 확인 가능 (seller_settlement_* 뷰 미연동) |

---

## 3) 관리자

### 주문 관리 (`/admin/orders/[order_id]`)

| 항목 | 내용 |
|------|------|
| **파일** | `app/admin/orders/[order_id]/page.tsx` |
| **액션** | 주문 상세 조회, ledger_entries 동반 표시 |
| **데이터** | `orders`, `ledger_entries` (Supabase 직접) |
| **완료 기준** | 주문ID로 증빙 추출 가능 |

### 정산 관리 (`/admin/settlement`, `/admin/settlement/[id]`)

| 항목 | 내용 |
|------|------|
| **파일** | `app/admin/settlement/page.tsx`, `app/admin/settlement/[id]/page.tsx` |
| **액션** | 정산 배치 목록, 상세 조회, 정산 확정 버튼 |
| **데이터** | `settlement_batches`, `rpc_admin_confirm_settlement` |
| **완료 기준** | 확정 후 재수정 불가 + 스냅샷/해시 + 감사로그 (admin_audit_logs 미구현) |

---

## 4) API 라우트 요약

| 경로 | 메서드 | 역할 |
|------|--------|------|
| `/api/orders/place` | POST | 주문 생성 (rpc_place_order) |
| `/api/orders/[id]` | GET | 주문 조회 |
| `/api/payment/stub` | POST | 결제 스텁 (rpc_confirm_payment) |
| `/api/webhook/payment` | POST | PG 콜백 (rpc_confirm_payment) |
| `/api/wallet/ledger` | GET | 원장 조회 (ledger_entries) |
| `/api/home/rails` | GET | 메인 레일 (content_items) |
| `/api/funnel/join` | POST | 관심합류 (join_funnel) |
| `/api/ab/assign-buy` | POST | 매수 버튼 AB (buy_button_exposure) |
| `/api/ab/assign-cohort` | POST | 유저 코호트 (user_cohort) |

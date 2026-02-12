# HANBANG × 업비트 UX 접목 스펙

> 업비트 사용법 Shorts 6개 레퍼런스 기반 정리 (회원가입/KYC/원화출금/KRW거래/입금/출금)

---

## 1) 진입 경로와 핵심 컴포넌트

### 1.1 로그인/온보딩

| 라우트 | 진입 경로 | 핵심 컴포넌트 |
|--------|-----------|---------------|
| `/login` | 홈 헤더 지갑버튼 → `Header.tsx` `href="/login"`, `AuthStatus` → 로그인 클릭 | `app/login/page.tsx` |
| `/signup` | 로그인 페이지 내 링크, `Header` | `app/signup/page.tsx` → `MobileSignup` |
| `/onboarding` | (직접 `/onboarding` 또는 추천 플로우) | `app/onboarding/page.tsx` → `InterestRail` → `InterestCard` |
| `LoginModal` | `InvestmentButton`, `MobileProductDetail` 등 | `components/auth/LoginModal.tsx` |

### 1.2 지갑 (입출금)

| 라우트 | 진입 경로 | 핵심 컴포넌트 |
|--------|-----------|---------------|
| `/wallet` | `BottomNavigation`(지갑 탭), `app/page.tsx` 지갑버튼, `Header` | `app/wallet/page.tsx` |
| `/wallet/deposit` | `/wallet` 내 입금 CTA | `app/wallet/deposit/page.tsx` |
| `/wallet/withdraw` | `/wallet` 내 출금 CTA | `app/wallet/withdraw/page.tsx` |

### 1.3 거래 상세

| 라우트 | 진입 경로 | 핵심 컴포넌트 |
|--------|-----------|---------------|
| `/market/[id]` | 홈 `RailCard`, `InterestStrip`, `CurationSection`, `HomeHero` | `app/market/[id]/page.tsx` |
| (내부) | - | `MarketHeader`, `MobilePriceChart`, `OrderBookSummary`, `OrderBookPanel`, `MobileOrderStickyBar`, `MobileOrderPanel`, `SideToggle` |

---

## 2) 업비트 UX 패턴 (10개)

| # | 패턴 | 설명 | 마이크로카피 예시 |
|---|------|------|-------------------|
| 1 | **다크 배경 + 패널 카드** | 배경 `#0d0d0d`, 카드 `#161616`, 테두리 `#2b2b2b` | - |
| 2 | **단계형 스텝퍼** | ① 회원가입 ② 고객확인 ③ 원화입금 순서 표시 | "가입 절차", "1. 로그인 → 2. 고객확인 → 3. 원화입금" |
| 3 | **상태 배지** | 현재 단계/마켓 구분 배지 | "KRW 마켓", "현재", "실시간", "정상" |
| 4 | **입금/출금 CTA 2열** | 입금·출금 버튼을 나란히 배치 | "입금", "출금", "KRW 충전", "계좌로 이체" |
| 5 | **수수료/처리상태 카드** | 수수료·처리상태·주의문구를 한 카드에 | "입금 수수료 무료", "출금 수수료 1건당 1,000원", "처리 상태 정상" |
| 6 | **가격 헤더** | 상단에 현재가·등락률·52주 고/저 | "₩12,300", "+3.2%", "전일대비", "52주高/52주低" |
| 7 | **차트 + 타임프레임 칩** | 차트 하단 1D/1W/1M 버튼 | "1D", "1W", "1M" |
| 8 | **호가창 3열** | 매도호가 | 수량 | 매수호가, 비율 바 | "매도호가", "수량", "매수호가", "탭하여 전체 호가 보기" |
| 9 | **매수/매도 토글 + 지정가/시장가** | 주문 패널 상단 토글 | "매수", "매도", "지정가", "시장가" |
| 10 | **하단 고정 주문바** | 현재가·등락률 + 매수/매도 CTA | "현재가", "매수", "매도" |

---

## 3) HANBANG 적용 맵핑표

| 우선순위 | 화면 | 컴포넌트 | 적용 패턴 | 비고 |
|---------|------|----------|----------|------|
| P0 | `/login` | `app/login/page.tsx` | 1, 2, 3 | 이미 적용됨, 마이크로카피만 점검 |
| P0 | `LoginModal` | `components/auth/LoginModal.tsx` | 1, 2, 3 | 모달 내 스텝퍼·배지 |
| P0 | `/onboarding` | `app/onboarding/page.tsx` | 1, 2, 3 | 스텝퍼·다크 배경 |
| P0 | `/wallet` | `app/wallet/page.tsx` | 1, 4, 5 | 입금/출금 CTA·수수료 카드(이미 적용) |
| P0 | `/wallet/deposit` | `app/wallet/deposit/page.tsx` | 1, 2, 3 | placeholder → 업비트형 레이아웃 |
| P0 | `/wallet/withdraw` | `app/wallet/withdraw/page.tsx` | 1, 2, 3 | placeholder → 업비트형 레이아웃 |
| P0 | `/market/[id]` | `MarketHeader` | 1, 6 | 가격 헤더·52주 고/저(이미 적용) |
| P0 | `/market/[id]` | `MobilePriceChart` | 1, 7 | 차트·타임프레임 칩(이미 있음) |
| P0 | `/market/[id]` | `OrderBook` | 1, 8 | 호가창 3열·비율 바(이미 적용) |
| P0 | `/market/[id]` | `MobileOrderPanel` | 1, 9 | 지정가/시장가·비율 버튼(이미 적용) |
| P0 | `/market/[id]` | `MobileOrderStickyBar` | 1, 10 | 하단 고정 바(이미 적용) |
| P1 | `/signup` | `MobileSignup` | 1, 2, 3 | 다크 배경·스텝퍼 정렬 |

---

## 4) 위험요소 및 절대 건드리면 안 되는 부분

### 4.1 위험요소 (로직 깨질 수 있는 지점)

| 위치 | 위험 | 완화 방법 |
|------|------|----------|
| `app/login/page.tsx` | `createClient` from `@/utils/supabase/client` | import 경로 유지 |
| `app/wallet/page.tsx` | `useStore()` → `userCash`, `holdings`, `history`, `sellStock` | StoreContext 의존성 유지 |
| `app/market/[id]/page.tsx` | `params.id` → API `/api/ab/assign-buy`, `/api/ab/assign-cohort` | API 호출·파라미터 유지 |
| `MobileOrderPanel` | `fetch('/api/orders/place', ...)` | body `productId`, `side`, `price`, `quantity` 유지 |
| `OrderBook` | 호가 데이터 구조 | `sellRows`, `buyRows`, `currentPrice` 형식 유지 |
| `onboarding` | `useUserTaste` (zustand) | zustand 미설치 시 런타임 에러 가능 → 빌드 확인 |

### 4.2 절대 건드리면 안 되는 부분

- **API 라우트**: `app/api/**` 전체
- **DB/RPC**: `supabase/migrations/**`, `utils/supabase/**` 로직
- **주문 플로우**: `app/api/orders/place/route.ts`, `rpc_place_order` 호출 구조
- **결제 웹훅**: `app/api/webhook/payment/route.ts`
- **StoreContext**: `context/StoreContext.tsx` — `buyStock`, `sellStock`, `userCash`, `holdings`, `history` 시그니처
- **Auth**: Supabase `signInWithPassword`, `signUp` 호출 방식

---

## 5) Compose 실행용 프롬프트 (한 덩어리)

```
[질문]
업비트 사용법 Shorts 6개(회원가입/KYC/원화출금/KRW거래/입금/출금)를 참고해서,
HANBANG 플랫폼의 /login(온보딩), /wallet(입출금), 거래 상세(차트/호가/주문패널) UI를 업비트형으로 접목해라.

[범위]
- /login: app/login/page.tsx — 단계형 스텝퍼, 상태 배지, 다크 배경
- LoginModal: components/auth/LoginModal.tsx — 동일 패턴
- /onboarding: app/onboarding/page.tsx — 스텝퍼, 다크 패널
- /wallet: app/wallet/page.tsx — 입금/출금 CTA, 수수료/처리상태 카드 (이미 있으면 마이크로카피만 점검)
- /wallet/deposit, /wallet/withdraw: placeholder → 업비트형 헤더·카드 레이아웃
- /market/[id]: MarketHeader, MobilePriceChart, OrderBook, MobileOrderPanel, MobileOrderStickyBar — 가격 헤더, 차트+타임프레임, 호가 3열, 지정가/시장가, 하단 스티키

[업비트 패턴]
1. 다크 배경 #0d0d0d, 패널 #161616, 테두리 #2b2b2b
2. 매수 파랑 #1e88e5, 매도 빨강 #e53935, 상승 초록 #00c48c
3. 단계형 스텝퍼 (회원가입→고객확인→원화입금)
4. 상태 배지: "KRW 마켓", "실시간", "현재"
5. 입금/출금 CTA 2열 그리드
6. 수수료/처리상태/주의문구 카드
7. 가격 헤더: 현재가, 등락률, 52주 고/저
8. 호가창: 매도호가|수량|매수호가, 비율 바
9. 매수/매도 토글 + 지정가/시장가 탭 + 25%/50%/75%/100% 버튼
10. 하단 고정 주문바

[제약]
- Tailwind + 인라인 style만 사용. 새 UI 라이브러리 추가 금지.
- 비즈니스 로직/DB/RPC/API route 절대 수정 금지.
- StoreContext, useStore, fetch('/api/orders/place'), Supabase auth 호출 구조 유지.
- 모바일 우선.

[출력]
- 변경된 파일 목록
- 로컬 확인: pnpm dev 후 http://localhost:3000
- 커밋 메시지: 한글 + 끝에 "YYYY-MM-DD HH:mm" 타임스탬프
```

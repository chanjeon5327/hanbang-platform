# UI V3 GATE LOG (B-PLAN SAFE REAPPLY)

**브랜치**: feat/ui-v3-exchange-first-safe  
**시작**: feat/step1-financial-stabilize-kyc-foundation @ 5b84293

---

## Gate 0: 시작 상태 확인 & 작업 브랜치 준비

**명령**:
```
git status
git branch --show-current
git rev-parse --short HEAD
git checkout -b feat/ui-v3-exchange-first-safe
pnpm run typecheck
pnpm run build
```

**결과**:
- 브랜치: feat/ui-v3-exchange-first-safe (신규)
- 커밋: 5b84293
- typecheck: 통과
- build: 통과 (exit 0)

**날짜**: 2026-02-17

---

## Gate 1: 엔젤/Angel 전면 제거

**명령**:
```
rg -n "엔젤|Angel|angel|연젤" app components lib context hooks
pnpm run typecheck
pnpm run build
```

**결과**:
- ripgrep (코드): 0건 (docs/ANGEL_AFTER.md 참조)
- typecheck: 통과
- build: 통과

**변경 파일**:
- components/market/AngelStorySection.tsx (삭제)
- components/market/AngelPitchDeckSection.tsx (삭제)
- components/home/GuestHero.tsx, PrimaryCTAs.tsx, SponsoredPickHero.tsx
- components/home/HomeView.tsx
- components/market/RevenueInfoSection.tsx, MarketChatSection.tsx, InvestConfirmModal.tsx
- components/market/DividendSimulatorV2.tsx, DividendSimulator.tsx
- components/chat/ProductChat.tsx, InvestorChat.tsx
- components/ProjectCard.tsx, InvestmentButton.tsx
- app/wallet/page.tsx, app/kyc/page.tsx
- app/globals.css, lib/design/tokens.ts
- docs/EXCHANGE_ROUTE_MAP.md, docs/VISUAL_REALITY_REPORT*.md

**날짜**: 2026-02-17

---

## Gate 3: PC 레이아웃 512px 제거 / 12컬럼

**결과**: typecheck/build 통과. docs/PC_WIDTH_BEFORE.md, docs/PC_WIDTH_AFTER.md 참조.

**변경**: max-w-lg → max-w-lg lg:max-w-7xl, px-4 → px-4 lg:px-8 (HomeView, market, market/[id], dashboard, notifications, kyc, CompanyFooter, Header)

**날짜**: 2026-02-17

---

## Gate 2: 거래소형 상세 EXCHANGE-FIRST (항상 노출)

**명령**:
```
pnpm run typecheck
pnpm run build
```

**결과**:
- typecheck: 통과
- build: 통과

**변경 파일**:
- app/market/[id]/page.tsx: ExchangeSection 조건 제거, 항상 렌더, isTradable prop 전달
- components/market/ExchangeSection.tsx: isTradable prop 추가, 하위 컴포넌트에 disabled 전달
- components/market/TradingPanelV2.tsx: disabled prop, 비활성 시 오버레이 + "거래 준비 중" 메시지
- components/market/OrderBookRealtime.tsx: disabled 시 "준비 중" empty state
- components/market/TradeHistoryRealtime.tsx: disabled 시 "준비 중" empty state

**증거**: /market/1(DIVIDEND_ONLY)에서도 거래소 섹션(차트/호가/체결/주문 패널) 뼈대 노출, 주문만 비활성

**날짜**: 2026-02-17

---

## Gate 4: /login ??? 텍스트 깨짐 수정

**원인**: 파일 인코딩 문제로 한글이 ???로 표시

**수정**: app/login/page.tsx 전체 UTF-8로 재작성 (로그인, 이메일, 비밀번호, 회원가입 등)

**날짜**: 2026-02-17

---

## Gate 5: wallet 캡처 안정화

**수정**:
- hooks/useWalletLedger.ts: fetch 10초 타임아웃 (AbortController)
- app/wallet/page.tsx: invest-summary, summary fetch 8초 타임아웃
- e2e/screenshot-audit.spec.ts: wallet 전용 timeout 45초, wait 3.5초

**날짜**: 2026-02-17

# 메인페이지(홈) 구조 문서

> 다른 AI가 현재 메인페이지 구조를 정확히 파악할 수 있도록 작성된 문서입니다.

---

## 1. 진입점 및 컴포넌트 트리

```
app/page.tsx (HomePage)
└── HomeView
    ├── [로그인 분기]
    │   ├── 로그인 O → 로그인 뷰 (①~⑧)
    │   └── 로그인 X → 비로그인 뷰 (①~③)
    ├── CompanyFooter
    ├── BottomNavigation (fixed)
    └── SupportBubble (fixed)
```

### app/page.tsx

```tsx
// 진입점: useAuth, useAssetFromLedger → HomeView에 props 전달
<HomeView
  assetData={assetData}           // useAssetFromLedger 결과 (ledger 기반 자산)
  assetLoading={isLoggedIn && (authLoading || assetLoading)}
  isLoggedIn={!!user}
  demoMode={false}
  showBottomNav
/>
```

---

## 2. 시각적 레이아웃 다이어그램

```
┌─────────────────────────────────────────────────────────────────┐
│                     메인페이지 (max-w-lg mx-auto px-4)             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  [로그인 시]                        [비로그인 시]          │   │
│  │                                                           │   │
│  │  ① SponsoredPickHero              ① GuestHero            │   │
│  │     (전문가 추천 청약/투자)           (3초 설득 + CTA 2개)   │   │
│  │     → /api/home/sponsored          [구경하기] [데모]      │   │
│  │                                                           │   │
│  │  ② InvestorDashboardCard          ② GuestPreview         │   │
│  │     ├─ AssetSummaryCard              (인기 1~2개)          │   │
│  │     │    총자산/등락률 → /mypage      → usePopularPicks    │   │
│  │     └─ LevelCard                                         │   │
│  │          LV1~5, 다음 레벨 게이지(%)                       │   │
│  │          progress=62 TODO: 투자금액 기반                   │   │
│  │                                                           │   │
│  │  ③ PrimaryCTAs                    ③ IpNewsSection        │   │
│  │     [현금 충전] [수익권 둘러보기]     (IP 수익 뉴스)        │   │
│  │     → useDeadlinePicks (마감임박 N건)                      │   │
│  │                                                           │   │
│  │  ④ InterestStrip                                          │   │
│  │     나의 관심 (가로 스크롤)                                │   │
│  │     → useMyInterests                                      │   │
│  │     → 관심 0개 시 usePopularPicks 상위 3개 자동 표시       │   │
│  │     → "관심 작품이 없어 인기 작품을 보여드립니다." 문구     │   │
│  │                                                           │   │
│  │  ⑤ CurationSection                                        │   │
│  │     모두의 추천 (가로 스크롤)                              │   │
│  │     → /api/home/popular                                   │   │
│  │                                                           │   │
│  │  ⑥ DeadlineRail                                           │   │
│  │     마감임박 (가로 스크롤)                                 │   │
│  │     → /api/home/deadline                                  │   │
│  │                                                           │   │
│  │  ⑦ [투자 현황] 링크 → /active-invest                      │   │
│  │                                                           │   │
│  │  ⑧ IpNewsSection (수익뉴스)                               │   │
│  │                                                           │   │
│  │  ⑨ [알림] 링크 → /notifications                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  CompanyFooter (회사 정보, 면책 문구)                             │
├─────────────────────────────────────────────────────────────────┤
│  BottomNavigation (fixed bottom)                                │
│  [홈] [투자] [지갑] [랭킹] [마이]                                │
├─────────────────────────────────────────────────────────────────┤
│  SupportBubble (fixed bottom-right) → 고객센터 플로팅 버튼         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. 로그인 시 블록 순서 (상→하)

| 순서 | 블록 | 컴포넌트/요소 | 비고 |
|------|------|---------------|------|
| 1 | 스폰서 | SponsoredPickHero | |
| 2 | 총자산+레벨 | InvestorDashboardCard | AssetSummaryCard + LevelCard 통합 |
| 3 | CTA | PrimaryCTAs | 현금 충전, 수익권 둘러보기 |
| 4 | 나의 관심 | InterestStrip | 관심 0개→인기 3개 fallback |
| 5 | 모두의 추천 | CurationSection | |
| 6 | 마감임박 | DeadlineRail | |
| 7 | 투자 현황 | Link | /active-invest |
| 8 | 수익뉴스 | IpNewsSection | |
| 9 | 알림 | Link | /notifications |

---

## 4. API 경계 매핑표

| UI 블록 | 컴포넌트 | 훅 | API | 비고 |
|---------|----------|-----|-----|------|
| 스폰서 | SponsoredPickHero | useSponsoredPick | GET /api/home/sponsored | productId → /market/[id] |
| 총자산 | AssetSummaryCard (내부) | useAssetFromLedger | GET /api/wallet/ledger | StoreContext(holdings) 연동 |
| 나의 관심 | InterestStrip | useMyInterests | GET /api/home/my-interests | 관심 0개 시 usePopularPicks |
| 인기 fallback | InterestStrip | usePopularPicks | GET /api/home/popular | items.length===0일 때만, 상위 3개 |
| 다음 행동 CTA | PrimaryCTAs | useDeadlinePicks | GET /api/home/deadline | 마감임박 N건 표시용 |
| 모두의 추천 | CurationSection | usePopularPicks | GET /api/home/popular | popular_content_mv 기반 |
| 마감임박 | DeadlineRail | useDeadlinePicks | GET /api/home/deadline | deadline asc, 같은 날 random |
| 인기 프리뷰(비로그인) | GuestPreview | usePopularPicks | GET /api/home/popular | 상위 2개만 |

---

## 5. 컴포넌트별 상세

### 5.1 SponsoredPickHero

- **역할**: 전문가 추천 청약/투자 영상 히어로 (16:9, autoPlay, IntersectionObserver)
- **데이터**: useSponsoredPick → /api/home/sponsored
- **표시**: 썸네일, 제목, 부제목, 수익률(%), 모집률(프로그레스바), CTA 버튼
- **클릭**: `/market/{productId}`

### 5.2 InvestorDashboardCard

- **역할**: 총자산 카드 + 나의 레벨 카드 통합 래퍼
- **구성**:
  - `AssetSummaryCard`: 총자산, 예수금, 보유평가, 손익, 수익률, 오늘 등락률 → 클릭 `/mypage`
  - `LevelCard`: LV1~5, 이모지(토끼/말/표범/사자/독수리), `showProgress` 시 다음 레벨 게이지(progress=62, TODO: 투자금액 기반)
- **props**: `data` (AssetData), `loading`

### 5.3 LevelCard

- **역할**: 나의 레벨 표시 + 다음 레벨까지 % 게이지
- **props**: `level` (1~5, 기본 3), `showProgress` (기본 false)
- **게이지**: `bg-gray-200` 트랙, `var(--toss-blue)` 진행바, "다음 레벨까지 {100-progress}%"

### 5.4 PrimaryCTAs

- **역할**: [현금 충전] → /wallet/deposit, [수익권 둘러보기] → /market
- **부가**: useDeadlinePicks로 "마감임박 N건" 텍스트 표시

### 5.5 InterestStrip

- **역할**: 나의 관심 (로그인 유저가 관심 표시한 작품)
- **데이터**: useMyInterests → /api/home/my-interests
- **fallback**: `items.length === 0`일 때 usePopularPicks 호출, 상위 3개 표시 + "관심 작품이 없어 인기 작품을 보여드립니다." 문구
- **UI**: SectionHeader + InterestCard 가로 스크롤
- **클릭**: `/market/{id}`

### 5.6 CurationSection

- **역할**: 모두의 추천 (누적 관심 수 기반 정렬)
- **데이터**: usePopularPicks → /api/home/popular
- **UI**: SectionHeader + InterestCard 가로 스크롤

### 5.7 DeadlineRail

- **역할**: 마감임박 (deadline 임박 순)
- **데이터**: useDeadlinePicks → /api/home/deadline
- **UI**: RailCard (aspect 4/5, "마감임박" 배지)

### 5.8 GuestHero (비로그인)

- **역할**: 3초 설득 퍼널 입구
- **내용**: "디지털 IP 수익권, 3초 만에 시작하세요" + CTA [구경하기] [데모]

### 5.9 GuestPreview (비로그인)

- **역할**: 인기 수익권 1~2개 프리뷰
- **데이터**: usePopularPicks (상위 2개)

### 5.10 IpNewsSection

- **역할**: IP 수익 뉴스 (현재 mock)
- **링크**: /news, /news/[id]

### 5.11 SectionHeader

- **역할**: 섹션 제목 + "전체보기" 링크
- **props**: title, viewAllHref (보통 /market)

### 5.12 InterestCard

- **역할**: 수익권 카드 (썸네일, 제목, 가격, 등락률, 프로그레스)
- **주의**: 가격/등락률은 하드코딩(₩12,300, +3.2%)

### 5.13 BottomNavigation

- **역할**: 하단 고정 네비 (홈, 투자, 지갑, 랭킹, 마이)
- **demoMode**: 데모용 메뉴로 전환

### 5.14 SupportBubble

- **역할**: 우하단 고객센터 플로팅 버튼
- **메뉴**: 문의하기, FAQ, 버그제보, 제휴문의

---

## 6. 데이터 흐름 요약

```
[로그인]
  useAuth → user
  useAssetFromLedger(isLoggedIn) → /api/wallet/ledger + StoreContext
  useSponsoredPick → /api/home/sponsored
  useMyInterests → /api/home/my-interests
  usePopularPicks → /api/home/popular (InterestStrip fallback, CurationSection)
  useDeadlinePicks → /api/home/deadline (PrimaryCTAs, DeadlineRail 공유)

[비로그인]
  usePopularPicks → /api/home/popular (GuestPreview에서 상위 2개)
```

---

## 7. Market(전체보기) 연동

- SectionHeader "전체보기" → `/market?tab=popular` (모두의 추천), `/market?tab=deadline` (마감임박), `/market?tab=my` (나의 관심)
- Market 페이지: 탭형 큐레이션 (전체/모두의 추천/마감임박/나의 관심/카테고리)
- API: `/api/market/popular`, `/api/market/deadline`, `/api/market/my-interests`, `/api/market/all` (limit/offset, next_cursor)

---

## 8. 파일 경로 참조

| 구분 | 경로 |
|------|------|
| 페이지 | `app/page.tsx` |
| 메인 뷰 | `components/home/HomeView.tsx` |
| 대시보드 카드 | `components/home/InvestorDashboardCard.tsx` |
| 레벨 카드 | `components/home/LevelCard.tsx` |
| 스폰서 | `components/home/SponsoredPickHero.tsx` |
| 자산 | `components/home/AssetSummaryCard.tsx`, `AssetCard.tsx` |
| CTA | `components/home/PrimaryCTAs.tsx` |
| 레일 | `InterestStrip.tsx`, `CurationSection.tsx`, `DeadlineRail.tsx` |
| 비로그인 | `GuestHero.tsx`, `GuestPreview.tsx` |
| 공통 | `SectionHeader.tsx`, `InterestCard.tsx` |
| 훅 | `hooks/useSponsoredPick.ts`, `usePopularPicks.ts`, `useDeadlinePicks.ts`, `useMyInterests.ts`, `useAssetFromLedger.ts` |
| API | `app/api/home/sponsored/route.ts`, `popular/route.ts`, `deadline/route.ts`, `my-interests/route.ts` |
| Market API | `app/api/market/popular/route.ts`, `deadline/route.ts`, `my-interests/route.ts`, `all/route.ts`, `item/[id]/route.ts` |
| Interest | `app/api/interests/toggle/route.ts` |

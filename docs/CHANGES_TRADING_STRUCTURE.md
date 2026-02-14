# 거래형 구조 전환 변경 요약

## 변경 전/후 구조 비교표

| 구분 | 변경 전 | 변경 후 |
|------|---------|---------|
| **상세페이지** | 콘텐츠 중심 (InvestmentConditions, YieldInfo, MobilizationGoal, TradingSection, DetailCTAs, RevenueInfoSection) | 거래형 (썸네일→타이틀→MarketStatsBar→투자안내→RecentInvestLog→채팅) |
| **상세 상단** | "‹ 뒤로" | "← 마켓으로" |
| **투자 CTA** | TradingPanel (청약/매수 탭) | Sticky 하단 "₩100,000 투자하기" + confirmation modal |
| **InvestorDashboardCard** | AssetSummaryCard + LevelCard 분리, /mypage 링크 | 총자산+등락률+레벨+투자현황 통합, /active-invest 링크 |
| **HomeView** | InvestorDashboardCard + "투자 현황" 단독 링크 | InvestorDashboardCard만 (투자현황 내장) |
| **Market default tab** | all | popular |
| **상세 배지** | 없음 | 인기(popular_cnt>=20), 마감임박(deadline 3일 이내) |

---

## 상세페이지 시각적 구조 (ASCII)

```
┌─────────────────────────────────────────────────────────┐
│  ← 마켓으로                                    [🌙]     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  [영상 썸네일]                                    │   │
│  │  [인기] [마감임박]  (조건부 배지)                  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  타이틀                                    [❤ 관심]    │
│  크리에이터 · 카테고리                                  │
│  [플랫폼] [수익권]                                      │
│                                                         │
│  ┌─ MarketStatsBar ─────────────────────────────────┐  │
│  │  [LIVE] [마감임박]                                │  │
│  │  모집률 ████████░░ 72%                           │  │
│  │  총 모집 | 참여자 | 현재 모집액 | 남은 금액       │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─ 투자 입력 안내 ────────────────────────────────┐   │
│  │  최소 ₩10,000부터... 하단 버튼을 눌러 참여       │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─ 최근 참여 (RecentInvestLog) ───────────────────┐   │
│  │  김**  ₩50만   방금 전                           │   │
│  │  이**  ₩100만  2분 전                            │   │
│  │  ...                                             │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─ ProductChat ────────────────────────────────────┐   │
│  │  투자자 채팅                                     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  [Sticky] ₩100,000 투자하기                             │
└─────────────────────────────────────────────────────────┘
```

---

## InvestorDashboardCard 시각적 구조 (ASCII)

```
┌─────────────────────────────────────────────────────────┐
│  총자산                                                 │
│  ₩1,234,567                                             │
│  오늘 +0.5% 상승 중                                     │
│                                                         │
│  나의 레벨                                    🐯        │
│  LV3                                                    │
│  ████████████░░░░░░░░  62%                              │
│  다음 레벨까지 38%                                       │
│  ─────────────────────────────────────────────────     │
│  [📊] 투자현황                                          │
│       총 3종목 · 진행중 2건 · 수익중 1건                 │
│                                                         │
│  (클릭 시 /active-invest)                               │
└─────────────────────────────────────────────────────────┘
```

---

## 신규 파일

- `components/market/MarketStatsBar.tsx`
- `components/market/RecentInvestLog.tsx`
- `components/market/InvestConfirmModal.tsx`
- `supabase/migrations/20260214_content_items_raise.sql`

## 수정 파일

- `app/market/[id]/page.tsx` (전면 개편)
- `app/api/market/item/[id]/route.ts` (total_raise, current_raise, popular_cnt)
- `hooks/useMarketItem.ts` (타입 확장)
- `components/home/InvestorDashboardCard.tsx` (통합 카드)
- `components/home/HomeView.tsx` (투자 현황 링크 제거)
- `app/market/page.tsx` (default tab=popular)

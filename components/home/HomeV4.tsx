'use client';

import Link from 'next/link';
import { formatKrw, formatRate } from '@/lib/utils/format';
import BottomNavigation from '@/components/home/BottomNavigation';
import CompanyFooter from '@/components/layout/CompanyFooter';
import SupportBubble from '@/components/support/SupportBubble';
import CardV5MarketCard from '@/components/market/CardV5MarketCard';
import { CardV5 } from '@/components/ui/CardV5';
import Section from '@/components/ui/Section';
import type { RailItem } from '@/hooks/useMarketTab';
import { useSponsoredPick } from '@/hooks/useSponsoredPick';
import { useMomentumPicks } from '@/hooks/useMomentumPicks';
import { useDeadlinePicks } from '@/hooks/useDeadlinePicks';
import { usePopularPicks } from '@/hooks/usePopularPicks';
import { useInvestSummary } from '@/hooks/useInvestSummary';
import { HBCardSkeleton } from '@/components/ui/HBSkeleton';
import Skeleton from '@/components/ui/Skeleton';
import { Gift, MessageCircle, Award } from 'lucide-react';

export type AssetData = {
  totalAssets: number;
  userCash: number;
  holdingsValue: number;
  returnAmount: number;
  returnRate: number;
  dailyChange?: number;
};

type Props = {
  assetData: AssetData | null;
  assetLoading?: boolean;
  isLoggedIn: boolean;
  demoMode?: boolean;
  showBottomNav?: boolean;
};

/* ===== A) HERO: OTT+금융 2컬럼 ===== */
function HeroSection() {
  const { pick, loading } = useSponsoredPick(true);

  if (loading || !pick) {
    return (
      <section className="px-4 pt-6 pb-10 md:pt-10 md:pb-12">
        <div className="mx-auto max-w-[1320px]">
          <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white p-6 md:p-10 md:flex md:gap-10">
            <div className="flex-1 space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-14 w-32" />
              <Skeleton className="h-8 w-40" />
            </div>
            <div className="mt-6 md:mt-0 md:w-[45%]">
              <Skeleton className="aspect-video w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  const monthlyYield = pick.yieldRate != null ? (pick.yieldRate / 12).toFixed(2) : '—';

  return (
    <section className="px-4 pt-6 pb-10 md:pt-10 md:pb-12">
      <div className="mx-auto max-w-[1320px]">
        <Link href={`/market/${pick.productId}`} className="block">
          <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-lg md:flex md:gap-10 md:p-10 p-6">
            {/* 왼쪽: 금융 */}
            <div className="flex-1 space-y-4 md:space-y-6">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                {pick.title}
              </h2>
              <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 tabular-nums">
                {pick.sharePriceKrw != null ? formatKrw(pick.sharePriceKrw) : '—'}
              </div>
              <p className="text-2xl md:text-3xl font-bold text-emerald-600">
                월 예상 수익률 {monthlyYield}%
              </p>
              <p className="text-sm md:text-base text-slate-600">
                최근 3개월 연속 배당 지급
              </p>
              <div
                className="w-full md:w-auto inline-flex items-center justify-center h-[52px] md:h-[56px] px-8 rounded-xl text-lg font-bold text-white transition hover:opacity-90"
                style={{ backgroundColor: 'var(--royal-blue)', minHeight: 52 }}
              >
                {pick.ctaLabel}
              </div>
            </div>
            {/* 오른쪽: OTT 미디어 */}
            <div className="mt-6 md:mt-0 md:w-[45%] shrink-0">
              <div className="relative aspect-video md:aspect-[4/3] rounded-2xl overflow-hidden shadow-md bg-slate-100">
                <img
                  src={pick.thumbnailUrl}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="eager"
                />
                <span
                  className="absolute top-3 left-3 inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold text-white"
                  style={{ backgroundColor: 'var(--royal-blue)' }}
                >
                  공식 스폰서 픽
                </span>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}

/* ===== B) 배당 안정성 스냅샷 3카드 ===== */
function DividendSnapshotSection({ isLoggedIn }: { isLoggedIn: boolean }) {
  const { data: investSummary, loading } = useInvestSummary(isLoggedIn);

  const avgMonthly = investSummary?.monthlyProfit != null ? formatKrw(investSummary.monthlyProfit) : '—';
  const lastPayDate = '—';
  const streak = investSummary && investSummary.monthlyProfit > 0 ? '3개월 연속' : '—';

  return (
    <section className="px-4 pb-10">
      <div className="mx-auto max-w-[1320px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardV5 className="p-6 md:p-8">
            <p className="text-sm font-medium text-slate-500 mb-2">평균 월 배당</p>
            <p className="text-xl md:text-2xl font-bold text-slate-900 tabular-nums">
              {loading ? '—' : avgMonthly}
            </p>
          </CardV5>
          <CardV5 className="p-6 md:p-8">
            <p className="text-sm font-medium text-slate-500 mb-2">최근 배당 지급일</p>
            <p className="text-xl md:text-2xl font-bold text-slate-900 tabular-nums">
              {lastPayDate}
            </p>
          </CardV5>
          <CardV5 className="p-6 md:p-8">
            <p className="text-sm font-medium text-slate-500 mb-2">연속 지급 스트릭</p>
            <p className="text-xl md:text-2xl font-bold text-slate-900 tabular-nums">
              {loading ? '—' : streak}
            </p>
          </CardV5>
        </div>
      </div>
    </section>
  );
}

/* ===== C) 실시간 거래 중 자산 (거래소 감성) ===== */
function LiveTradingSection() {
  const { items, loading } = useMomentumPicks(true);

  return (
    <section className="px-4 pb-10">
      <div className="mx-auto max-w-[1320px]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900" style={{ fontSize: 20 }}>
            실시간 거래 중 자산
          </h3>
          <Link
            href="/market"
            className="text-sm font-semibold text-blue-700 hover:underline"
          >
            전체보기
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <HBCardSkeleton key={i} />
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.slice(0, 6).map((item) => {
              const totalRaise = item.total_raise ?? 0;
              const changeRate = 0;
              const isUp = changeRate > 0;
              const isDown = changeRate < 0;
              return (
                <Link
                  key={item.id}
                  href={`/market/${item.id}`}
                  className="block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition"
                >
                  <h4 className="font-bold text-slate-900 line-clamp-2 mb-3">{item.title}</h4>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-2xl font-bold text-slate-900 tabular-nums">
                      {totalRaise > 0 ? formatKrw(totalRaise) : '—'}
                    </span>
                    <span
                      className={`text-sm font-semibold tabular-nums ${
                        isUp ? 'text-red-600' : isDown ? 'text-blue-600' : 'text-slate-500'
                      }`}
                    >
                      {changeRate !== 0 ? `${isUp ? '+' : ''}${changeRate}%` : '—'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">거래량 —</p>
                </Link>
              );
            })}
          </div>
        ) : (
          <CardV5 variant="ghost">
            <p className="body-sm text-center text-slate-500">수익권이 없습니다.</p>
          </CardV5>
        )}
      </div>
    </section>
  );
}

/* ===== D) 팬 등급 & 리워드 ===== */
function FanLevelSection() {
  const levels = [
    { name: 'BRONZE', icon: Gift, desc: '굿즈 구매 시 5% 할인' },
    { name: 'SILVER', icon: MessageCircle, desc: '팬 채팅 참여 가능' },
    { name: 'GOLD', icon: Award, desc: '한정판 배지 수령' },
  ];

  return (
    <section className="px-4 pb-10">
      <div className="mx-auto max-w-[1320px]">
        <h3 className="text-xl font-bold text-slate-900 mb-6" style={{ fontSize: 20 }}>
          팬 등급 & 리워드
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {levels.map(({ name, icon: Icon, desc }) => (
            <CardV5 key={name} className="p-6 md:p-8 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <Icon size={24} className="text-slate-600" strokeWidth={2} />
              </div>
              <p className="font-bold text-slate-900 mb-2">{name}</p>
              <p className="text-sm text-slate-600">{desc}</p>
            </CardV5>
          ))}
        </div>
      </div>
    </section>
  );
}

function AssetSummarySection({ data, loading, isLoggedIn }: { data: AssetData | null; loading?: boolean; isLoggedIn: boolean }) {
  if (!isLoggedIn) {
    return (
      <Section>
        <CardV5>
          <p className="body text-center" style={{ color: 'var(--text-secondary)' }}>로그인 후 자산 현황을 확인하세요</p>
          <Link
            href="/login"
            className="block mt-4 py-3 rounded-xl body font-semibold text-center text-white transition hover:opacity-90"
            style={{ backgroundColor: 'var(--royal-blue)' }}
          >
            로그인
          </Link>
        </CardV5>
      </Section>
    );
  }

  if (loading || !data) {
    return (
      <Section>
        <CardV5>
          <div className="skeleton rounded-lg h-12 w-32 mb-4" />
          <div className="skeleton rounded-lg h-6 w-24" />
        </CardV5>
      </Section>
    );
  }

  const { totalAssets, returnAmount, returnRate } = data;
  const isPositive = returnRate >= 0;

  return (
    <Section>
      <Link href="/mypage" className="block">
        <CardV5>
          <p className="caption font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>총 자산</p>
          <div className="metric-xl tabular-nums" style={{ color: 'var(--text)' }}>{formatKrw(totalAssets)}</div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="body-sm font-semibold tabular-nums" style={{ color: isPositive ? 'var(--emerald)' : 'var(--accent-loss)' }}>
              {isPositive ? '+' : ''}{formatRate(returnRate)}
            </span>
            <span className="caption" style={{ color: 'var(--text-secondary)' }}>
              ({isPositive ? '+' : ''}{formatKrw(returnAmount)})
            </span>
          </div>
        </CardV5>
      </Link>
    </Section>
  );
}

function InfoRail() {
  return (
    <Section title="정보" rightHref="/trust" rightLabel="전체보기">
      <CardV5 variant="ghost">
        <p className="body-sm line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
          IP 수익권 · 배당 · 모집 · 원장검증
        </p>
      </CardV5>
    </Section>
  );
}

function InvestRail() {
  const { items, loading } = useDeadlinePicks(true);

  return (
    <Section title="투자" rightHref="/market?tab=deadline" rightLabel="전체보기">
      {loading ? (
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="w-[180px] shrink-0">
              <HBCardSkeleton />
            </div>
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {items.map((item, i) => (
            <div key={item.id} className="w-[180px] shrink-0">
              <CardV5MarketCard item={item as RailItem} index={i} />
            </div>
          ))}
        </div>
      ) : (
        <CardV5 variant="ghost">
          <p className="body-sm text-center" style={{ color: 'var(--text-secondary)' }}>마감 예정인 작품이 없습니다.</p>
        </CardV5>
      )}
    </Section>
  );
}

export default function HomeV4({ assetData, assetLoading = false, isLoggedIn, demoMode = false, showBottomNav = true }: Props) {
  return (
    <div className="pb-24 bg-slate-50 min-h-screen">
      <div className="mx-auto max-w-[1320px]">
        <HeroSection />
        <DividendSnapshotSection isLoggedIn={isLoggedIn} />
        <LiveTradingSection />
        <FanLevelSection />
      </div>

      <div className="px-4 pt-6">
        <div className="mx-auto max-w-[1320px] space-y-6">
          <AssetSummarySection data={assetData} loading={assetLoading} isLoggedIn={isLoggedIn} />
          <InfoRail />
          <InvestRail />
        </div>
      </div>

      <Section title="모두의 추천" rightHref="/market?tab=popular" rightLabel="전체보기">
        <RecommendationRail />
      </Section>

      <CompanyFooter />
      {showBottomNav && <BottomNavigation demoMode={demoMode} />}
      <SupportBubble />
    </div>
  );
}

function RecommendationRail() {
  const { items, loading } = usePopularPicks(true);

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="w-[180px] shrink-0">
            <HBCardSkeleton />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <CardV5 variant="ghost">
        <p className="body-sm text-center" style={{ color: 'var(--text-secondary)' }}>아직 추천 작품이 없습니다.</p>
      </CardV5>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
      {items.map((item, i) => (
        <div key={item.id} className="w-[180px] shrink-0">
          <CardV5MarketCard item={item as RailItem} index={i} />
        </div>
      ))}
    </div>
  );
}

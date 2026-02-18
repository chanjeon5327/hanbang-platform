'use client';

import Link from 'next/link';
import { formatKrw, formatRate } from '@/lib/utils/format';
import BottomNavigation from '@/components/home/BottomNavigation';
import CompanyFooter from '@/components/layout/CompanyFooter';
import SupportBubble from '@/components/support/SupportBubble';
import SponsoredPickHeroV5 from '@/components/home/SponsoredPickHeroV5';
import CardV5MarketCard from '@/components/market/CardV5MarketCard';
import { CardV5 } from '@/components/ui/CardV5';
import Section from '@/components/ui/Section';
import type { RailItem } from '@/hooks/useMarketTab';
import { useMomentumPicks } from '@/hooks/useMomentumPicks';
import { useDeadlinePicks } from '@/hooks/useDeadlinePicks';
import { usePopularPicks } from '@/hooks/usePopularPicks';
import { HBCardSkeleton } from '@/components/ui/HBSkeleton';

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

function TradeRail() {
  const { items, loading } = useMomentumPicks(true);

  return (
    <Section title="거래" rightHref="/market" rightLabel="전체보기">
      {loading ? (
        <div className="grid grid-cols-2 hb-stagger" style={{ gap: 'var(--space-md)' }}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <HBCardSkeleton key={i} />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-2 hb-stagger" style={{ gap: 'var(--space-md)' }}>
          {items.slice(0, 6).map((item, i) => (
            <CardV5MarketCard key={item.id} item={item as RailItem} index={i} />
          ))}
        </div>
      ) : (
        <CardV5 variant="ghost">
          <p className="body-sm text-center" style={{ color: 'var(--text-secondary)' }}>수익권이 없습니다.</p>
        </CardV5>
      )}
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
    <div className="pb-24" style={{ backgroundColor: 'var(--bg)' }}>
      <SponsoredPickHeroV5 />
      <AssetSummarySection data={assetData} loading={assetLoading} isLoggedIn={isLoggedIn} />
      <InfoRail />
      <TradeRail />
      <InvestRail />

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

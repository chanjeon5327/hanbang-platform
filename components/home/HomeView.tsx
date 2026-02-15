'use client';

import Link from 'next/link';
import { Bell, Activity, TrendingUp } from 'lucide-react';
import BottomNavigation from '@/components/home/BottomNavigation';
import GuestHero from '@/components/home/GuestHero';
import GuestPreview from '@/components/home/GuestPreview';
import SponsoredPickHero from '@/components/home/SponsoredPickHero';
import LiveMomentumBar from '@/components/home/LiveMomentumBar';
import InvestorDashboardCard from '@/components/home/InvestorDashboardCard';
import PrimaryCTAs from '@/components/home/PrimaryCTAs';
import InterestStrip from '@/components/home/InterestStrip';
import CurationSection from '@/components/home/CurationSection';
import AdSlot from '@/components/ads/AdSlot';
import IpNewsSection from '@/components/news/IpNewsSection';
import SupportBubble from '@/components/support/SupportBubble';
import CompanyFooter from '@/components/layout/CompanyFooter';
import DeadlineRail from '@/components/home/DeadlineRail';
import RecentDividendWidget from '@/components/home/RecentDividendWidget';

export type AssetData = {
  totalAssets: number;
  userCash: number;
  holdingsValue: number;
  returnAmount: number;
  returnRate: number;
  dailyChange?: number;
};

const ROYAL = {
  card: 'var(--card)',
  blue: 'var(--royal-blue)',
  text: 'var(--text)',
  secondary: 'var(--text-secondary)',
  border: 'var(--border)',
} as const;

type Props = {
  assetData: AssetData | null;
  assetLoading?: boolean;
  isLoggedIn: boolean;
  demoMode?: boolean;
  showBottomNav?: boolean;
};

/**
 * 3초 설득 퍼널 입구
 * - 로그인: (A) AssetSummaryCard (B) PrimaryCTAs (C) RecommendedRails
 * - 비로그인: GuestHero + CTA 2개 + GuestPreview(인기 1~2)
 */
export default function HomeView({ assetData, assetLoading = false, isLoggedIn, demoMode = false, showBottomNav = true }: Props) {
  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--bg)' }}>
      <main className="max-w-lg mx-auto px-4 pt-4 pb-6 space-y-4">
        {isLoggedIn ? (
          <>
            {/* 스폰서: 영상 히어로형 - AssetSummaryCard 위 */}
            <SponsoredPickHero />

            {/* 실시간 참여 지표 바 */}
            <LiveMomentumBar />

            {/* 실시간 배당 위젯 + 누적 지급 */}
            <RecentDividendWidget />

            {/* (A) 총자산 + 나의 레벨 (다음 레벨 게이지 포함) */}
            <InvestorDashboardCard data={assetData} loading={assetLoading} isLoggedIn={isLoggedIn} />

            {/* (B) 다음 행동: 현금 충전, 수익권 둘러보기 */}
            <PrimaryCTAs enabled={!demoMode} />

            {/* (C) 나의 관심 → 모두의 추천 → 마감임박 */}
            <InterestStrip enabled={!demoMode} />
            <CurationSection title="모두의 추천" enabled={!demoMode} />
            <AdSlot position="home_mid" />
            <DeadlineRail enabled={!demoMode} />

            <Link href="/dashboard" className="rounded-[16px] p-4 border flex items-center gap-3 tap-scale" style={{ backgroundColor: ROYAL.card, borderColor: ROYAL.border }}>
              <TrendingUp size={20} strokeWidth={2} style={{ color: ROYAL.blue }} />
              <div>
                <div className="text-[14px] font-semibold" style={{ color: ROYAL.text }}>투자 대시보드</div>
                <div className="text-[12px]" style={{ color: ROYAL.secondary }}>종목별 수익·배당 현황</div>
              </div>
            </Link>
            <Link href="/active-invest" className="rounded-[16px] p-4 border flex items-center gap-3 tap-scale" style={{ backgroundColor: ROYAL.card, borderColor: ROYAL.border }}>
              <Activity size={20} strokeWidth={2} style={{ color: ROYAL.secondary }} />
              <div>
                <div className="text-[14px] font-semibold" style={{ color: ROYAL.text }}>엔젤 투자 현황</div>
                <div className="text-[12px]" style={{ color: ROYAL.secondary }}>진행 중인 수익권 보기</div>
              </div>
            </Link>

            <IpNewsSection />

            <Link href="/notifications" className="rounded-[16px] p-4 border flex items-center gap-3 tap-scale" style={{ backgroundColor: ROYAL.card, borderColor: ROYAL.border }}>
              <Bell size={20} strokeWidth={2} style={{ color: ROYAL.secondary }} />
              <div>
                <div className="text-[14px] font-semibold" style={{ color: ROYAL.text }}>알림</div>
                <div className="text-[12px]" style={{ color: ROYAL.secondary }}>배당·정산 알림 확인</div>
              </div>
            </Link>
          </>
        ) : (
          <>
            {/* 1. 서비스 설명 + CTA 2개 (구경하기/데모) */}
            <GuestHero />

            {/* 실시간 참여 지표 바 */}
            <LiveMomentumBar />

            {/* 실시간 배당 위젯 (비로그인) */}
            <RecentDividendWidget />

            {/* 2. 인기 1~2개 프리뷰 - usePopularPicks 경계 */}
            <GuestPreview enabled={!demoMode} />

            {/* 3. 뉴스 */}
            <IpNewsSection />
          </>
        )}

        <Link href="/trust" className="block rounded-[16px] p-4 border text-center tap-scale" style={{ backgroundColor: ROYAL.card, borderColor: ROYAL.border }}>
          <span className="text-[14px] font-semibold" style={{ color: ROYAL.blue }}>엔젤 투자 구조 보기</span>
          <span className="text-[12px] block mt-0.5" style={{ color: ROYAL.secondary }}>원장·결제·정산 흐름 확인</span>
        </Link>

        <div className="h-6" />
      </main>

      <CompanyFooter />
      {showBottomNav && <BottomNavigation demoMode={demoMode} />}
      <SupportBubble />
    </div>
  );
}

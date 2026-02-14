'use client';

import Link from 'next/link';
import { Bell, Activity } from 'lucide-react';
import BottomNavigation from '@/components/home/BottomNavigation';
import GuestHero from '@/components/home/GuestHero';
import GuestPreview from '@/components/home/GuestPreview';
import SponsoredPickHero from '@/components/home/SponsoredPickHero';
import InvestorDashboardCard from '@/components/home/InvestorDashboardCard';
import PrimaryCTAs from '@/components/home/PrimaryCTAs';
import InterestStrip from '@/components/home/InterestStrip';
import CurationSection from '@/components/home/CurationSection';
import IpNewsSection from '@/components/news/IpNewsSection';
import SupportBubble from '@/components/support/SupportBubble';
import CompanyFooter from '@/components/layout/CompanyFooter';
import DeadlineRail from '@/components/home/DeadlineRail';

export type AssetData = {
  totalAssets: number;
  userCash: number;
  holdingsValue: number;
  returnAmount: number;
  returnRate: number;
  dailyChange?: number;
};

const TOSS = {
  card: '#ffffff',
  blue: '#3182f6',
  text: '#191f28',
  secondary: '#6b7684',
  border: '#e5e8eb',
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
    <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--toss-bg)' }}>
      <main className="max-w-lg mx-auto px-4 pt-4 pb-6 space-y-4">
        {isLoggedIn ? (
          <>
            {/* 스폰서: 영상 히어로형 - AssetSummaryCard 위 */}
            <SponsoredPickHero />

            {/* (A) 총자산 + 나의 레벨 (다음 레벨 게이지 포함) */}
            <InvestorDashboardCard data={assetData} loading={assetLoading} isLoggedIn={isLoggedIn} />

            {/* (B) 다음 행동: 현금 충전, 수익권 둘러보기 */}
            <PrimaryCTAs enabled={!demoMode} />

            {/* (C) 나의 관심 → 모두의 추천 → 마감임박 */}
            <InterestStrip enabled={!demoMode} />
            <CurationSection title="모두의 추천" enabled={!demoMode} />
            <DeadlineRail enabled={!demoMode} />

            <Link href="/active-invest" className="rounded-2xl p-4 border flex items-center gap-3" style={{ backgroundColor: TOSS.card, borderColor: TOSS.border }}>
              <Activity size={20} strokeWidth={2} style={{ color: TOSS.blue }} />
              <div>
                <div className="text-[14px] font-semibold" style={{ color: TOSS.text }}>투자 현황</div>
                <div className="text-[12px]" style={{ color: TOSS.secondary }}>진행 중인 수익권 보기</div>
              </div>
            </Link>

            <IpNewsSection />

            <Link href="/notifications" className="rounded-2xl p-4 border flex items-center gap-3" style={{ backgroundColor: TOSS.card, borderColor: TOSS.border }}>
              <Bell size={20} strokeWidth={2} style={{ color: TOSS.secondary }} />
              <div>
                <div className="text-[14px] font-semibold" style={{ color: TOSS.text }}>알림</div>
                <div className="text-[12px]" style={{ color: TOSS.secondary }}>수익·정산 알림 확인</div>
              </div>
            </Link>
          </>
        ) : (
          <>
            {/* 1. 서비스 설명 + CTA 2개 (구경하기/데모) */}
            <GuestHero />

            {/* 2. 인기 1~2개 프리뷰 - usePopularPicks 경계 */}
            <GuestPreview enabled={!demoMode} />

            {/* 3. 뉴스 */}
            <IpNewsSection />
          </>
        )}

        <Link href="/trust" className="block rounded-2xl p-4 border text-center" style={{ backgroundColor: TOSS.card, borderColor: TOSS.border }}>
          <span className="text-[14px] font-semibold" style={{ color: TOSS.blue }}>투자 구조 보기</span>
          <span className="text-[12px] block mt-0.5" style={{ color: TOSS.secondary }}>원장·결제·정산 흐름 확인</span>
        </Link>

        <div className="h-6" />
      </main>

      <CompanyFooter />
      {showBottomNav && <BottomNavigation demoMode={demoMode} />}
      <SupportBubble />
    </div>
  );
}

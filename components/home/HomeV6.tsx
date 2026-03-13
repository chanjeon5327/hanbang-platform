'use client';

import HeroCinematic from '@/components/HeroCinematic';
import MarketTickerBar from '@/components/home/MarketTickerBar';
import CurationRail from '@/components/home/CurationRail';
import MyAssetCard from '@/components/home/MyAssetCard';
import MarketMoodStrip from '@/components/home/MarketMoodStrip';
import HallyuIndexSection from '@/components/home/HallyuIndexSection';
import DeadlineRail from '@/components/home/DeadlineRail';
import NewsSection from '@/components/home/NewsSection';
import OverlayRecoCard from '@/components/home/OverlayRecoCard';
import Link from 'next/link';
import { marketItems } from '@/lib/mock/marketItems';

// 콘텐츠 자산명 자연화 매핑
const TITLE_MAP: Record<string, string> = {
  '여행가 제이': '블루웨이 시즌3',
  '침착맨': '라운지 나인',
  '먹방연구소': '테이블 로그',
  'K-POP STAGE': '사운드 플로어',
  '영화 블록버스터': '필름 하우스',
};

export default function HomeV6() {
  const trending4 = marketItems.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#0B1120]">

      {/* ① 히어로 ─ max-w 제한, 상단 여백 확보 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-5 pt-5 pb-3">
        <HeroCinematic
          headline={
            <>
              내가 좋아하는 크리에이터와 동업자가 되고.
              <br />
              <br />
              매달 수익을 받습니다.
            </>
          }
          sublineTop="내가 좋아하는 콘텐츠를 사고팔고."
          primaryCta={{ label: '투자 시작', href: '/market' }}
          secondaryCta={{ label: '둘러보기', href: '/market' }}
        />
      </div>

      {/* ② 실시간 시세 티커 ─ 풀폭 */}
      <MarketTickerBar />

      {/* ③ 추천 큐레이팅 ─ white */}
      <div className="bg-white border-t border-black/[0.06]">
        <CurationRail />
      </div>

      {/* ④ 지금 주목받는 콘텐츠 ─ gray, 4열 그리드 직접 렌더 */}
      <div className="bg-[#F7F8FA] border-t border-black/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 py-8 sm:py-10">
          <div className="flex items-end justify-between mb-5">
            <div>
              <h2 className="text-[20px] sm:text-[22px] font-extrabold tracking-[-0.02em]">
                지금 주목받는 콘텐츠
              </h2>
              <p className="mt-1 text-[13px] text-black/55">
                팬덤 반응이 높은 콘텐츠를 선별했습니다.
              </p>
            </div>
            <Link
              href="/market"
              className="text-[13px] text-black/50 hover:text-black transition shrink-0"
            >
              전체 마켓 →
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {trending4.map((it) => (
              <OverlayRecoCard
                key={it.id}
                item={{ ...it, title: TITLE_MAP[it.title] ?? it.title }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ⑤ 내 자산 ─ white */}
      <div className="bg-white border-t border-black/[0.06]">
        <MyAssetCard />
      </div>

      {/* ⑥ 시장 동향 ─ gray */}
      <div className="bg-[#F7F8FA] border-t border-black/[0.06]">
        <MarketMoodStrip />
      </div>

      {/* ⑦ 한류지수 ─ white */}
      <div className="bg-white border-t border-black/[0.06]">
        <HallyuIndexSection />
      </div>

      {/* ⑧ 마감 임박 ─ blue-tinted */}
      <div className="bg-[#EFF6FF] border-t border-blue-100">
        <DeadlineRail />
      </div>

      {/* ⑨ 뉴스 & 업계동향 ─ white */}
      <div className="bg-white border-t border-black/[0.06]">
        <NewsSection />
      </div>

      {/* footer 하단 여백 */}
      <div className="h-10 sm:h-14 bg-[#F7F8FA] border-t border-black/[0.06]" />
    </div>
  );
}

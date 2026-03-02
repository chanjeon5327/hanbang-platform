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
import { marketItems } from '@/lib/mock/marketItems';

export default function HomeV6() {
  const trending4 = marketItems.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#0B1120]">
      <section className="px-5 sm:px-6 pt-6 pb-4 max-w-7xl mx-auto">
        <HeroCinematic
          headline={
            <>
              내가 좋아하는 콘텐츠 사고 팔고.
              <br />
              <br />
              매달 수익을 받습니다.
            </>
          }
          sublineTop="내가 좋아하는 크리에이터와 동업자가 됩니다."
          primaryCta={{ label: '지금 투자 시작', href: '/invest/start' }}
          secondaryCta={{ label: '마켓 둘러보기', href: '/market' }}
        />
      </section>
      <MarketTickerBar />

      {/* 1) 추천 큐레이팅 */}
      <CurationRail />

      {/* 2) 내 자산 (숫자 금지, 문구 중심) */}
      <MyAssetCard />

      {/* 3) 지금 주목받는 콘텐츠 (4개 꽉) */}
      <section className="px-5 sm:px-6 pb-10 sm:pb-12 max-w-7xl mx-auto">
        <div className="mb-5">
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-[-0.3px]">
            지금 주목받는 콘텐츠
          </h2>
          <p className="text-sm text-black/55 mt-1">
            한류 콘텐츠 자산 — 지금 가장 &quot;클릭&quot;되는 4개
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {trending4.map((it) => (
            <OverlayRecoCard key={it.id} item={it} />
          ))}
        </div>
      </section>

      {/* 4) 시장 동향(짧고 직관) */}
      <MarketMoodStrip />

      {/* 5) 한류지수(업비트형: 위 얇은 선 + 아래 띠/바) */}
      <HallyuIndexSection />

      {/* 6) 마감 임박(썸네일+링크) */}
      <DeadlineRail />

      {/* 7) 뉴스(고객용) */}
      <NewsSection />

      <footer className="px-6 py-10 text-center text-xs text-black/45">
        © HANBANG. All rights reserved.
      </footer>
    </div>
  );
}

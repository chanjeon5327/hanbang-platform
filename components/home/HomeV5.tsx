'use client';

import HeroCinematic from '@/components/home/HeroCinematic';
import OverlayRecoCard from '@/components/home/OverlayRecoCard';
import MarketTickerBar from '@/components/home/MarketTickerBar';
import MarketTrendSection from '@/components/home/MarketTrendSection';
import DeadlineRail from '@/components/home/DeadlineRail';
import NewsSection from '@/components/home/NewsSection';
import { marketItems } from '@/lib/mock/marketItems';

export default function HomeV5() {
  const trending4 = marketItems.slice(0, 4);
  return (
    <div className="min-h-screen bg-[#0B1120] text-white">
      {/* 1) Cinematic Hero */}
      <HeroCinematic />

      {/* 2) 실시간 마켓 티커 바 (업비트형 느낌) */}
      <MarketTickerBar />

      {/* 3) 추천 IP (OTT 카드형 오버레이) */}
      <section className="px-5 sm:px-6 py-10 sm:py-14 max-w-7xl mx-auto">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">지금 주목받는 IP</h2>
            <p className="text-sm text-white/60 mt-1">실시간 관심·거래량 기반 추천</p>
          </div>
          <button className="text-sm text-white/70 hover:text-white transition">
            더보기 →
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {trending4.map((it) => (
            <OverlayRecoCard key={it.id} item={it} />
          ))}
        </div>
      </section>

      {/* 4) 시장 동향 (라인 + 스파크라인) */}
      <MarketTrendSection />

      {/* 5) 마감 임박 레일 (긴급성) */}
      <DeadlineRail />

      {/* 6) 뉴스 / 업계동향 */}
      <NewsSection />

      <footer className="px-6 py-10 text-center text-xs text-white/40">
        © HANBANG. All rights reserved.
      </footer>
    </div>
  );
}

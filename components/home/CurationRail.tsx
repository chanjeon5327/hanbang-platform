'use client';

import Link from 'next/link';
import { marketItems, formatKRW } from '@/lib/mock/marketItems';

const CURATED_ORDER = [
  'city-walk',   // travel-j <-> city-walk
  'kpop-stage',  // chim <-> kpop-stage
  'chim',
  'sports-pick', // muklab <-> sports-pick
  'muklab',
  'k-drama',
  'chong',
  'food-trip',
  'travel-j',
  'talk-issue',
];

export default function CurationRail() {
  const byId = Object.fromEntries(marketItems.map((it) => [it.id, it]));
  const curated = CURATED_ORDER.map((id) => byId[id]).filter(Boolean);

  return (
    <section id="home-ownership-anchor" className="px-5 sm:px-6 pt-10 sm:pt-12 pb-10 sm:pb-12 max-w-7xl mx-auto">
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-[-0.3px]">
            내가 좋아하는 콘텐츠를 소유해보세요.
          </h2>
          <p className="text-sm text-black/50 mt-1">
            오늘 가장 주목받는 콘텐츠 자산을 직접 소유하는 경험
          </p>
        </div>
        <Link href="/market" className="text-sm text-black/50 hover:text-black transition shrink-0 font-medium">
          마켓 전체 →
        </Link>
      </div>

      <div className="flex gap-3.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {curated.map((it) => {
          const up = it.chgPct >= 0;
          return (
            <Link
              key={it.id}
              href={`/market/${it.id}`}
              className="group relative min-w-[280px] sm:min-w-[340px] h-[220px] sm:h-[250px] overflow-hidden rounded-2xl hover:border-[#2563EB]/25 bg-[#0B1224] shadow-[0_4px_14px_rgba(0,0,0,0.08)] hover:shadow-[0_10px_28px_rgba(0,0,0,0.14)] transition duration-300"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={it.thumbnail}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.05] pointer-events-none"
                loading="lazy"
              />

              {/* 오버레이 — from-black/90 → /78, via-black/22 → /10 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/10 to-black/0 pointer-events-none" />

              {/* 하단 텍스트 보호층 */}
              <div className="absolute bottom-0 left-0 right-0 h-[100px] bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

              {/* 상단 배지 — bg/border 밝기 보정 */}
              <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-white/22 border border-white/30 text-white tracking-wide">
                    {it.tagMain}
                  </span>
                </div>
                {it.annualReturn && (
                  <span className="text-[10px] font-extrabold px-2 py-1 rounded-full bg-emerald-500/32 border border-emerald-400/42 text-emerald-100">
                    연 {it.annualReturn}%
                  </span>
                )}
              </div>

              {/* 하단 콘텐츠 */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                {/* creator — white/55 → white/75 */}
                <div className="text-[11px] text-white/75">{it.creator} · {it.category}</div>
                <div className="mt-0.5 text-[17px] font-extrabold text-white leading-tight">{it.title}</div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="text-[14px] font-extrabold text-white tabular-nums">{formatKRW(it.price)}</div>
                  <div className={`text-[13px] font-extrabold tabular-nums ${up ? 'text-emerald-300' : 'text-red-300'}`}>
                    {up ? '▲' : '▼'} {Math.abs(it.chgPct).toFixed(1)}%
                  </div>
                </div>

                {/* 판매 진행률 — 라벨/바 밝기 보정 */}
                {it.soldPct !== undefined && (
                  <div className="mt-2">
                    <div className="w-full h-[3px] rounded-full bg-white/22 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#2563EB]/90"
                        style={{ width: `${it.soldPct}%` }}
                      />
                    </div>
                    {/* white/40 → white/60 */}
                    <div className="mt-1 text-[10px] text-white/60 text-right">{it.soldPct}% 판매됨</div>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

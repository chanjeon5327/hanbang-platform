'use client';

import Link from 'next/link';
import { marketItems, formatKRW } from '@/lib/mock/marketItems';

export default function CurationRail() {
  const curated = marketItems.slice(0, 10);

  return (
    <section id="home-ownership-anchor" className="px-5 sm:px-6 pt-10 sm:pt-12 pb-10 sm:pb-12 max-w-7xl mx-auto">
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-[-0.3px]">
            내가 좋아하는 콘텐츠를 소유해보세요.
          </h2>
          <p className="text-sm text-black/55 mt-1">
            오늘 가장 주목받는 콘텐츠 자산을 직접 소유하는 경험
          </p>
        </div>
        <Link href="/market" className="text-sm text-black/55 hover:text-black transition shrink-0">
          마켓 전체 →
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {curated.map((it) => {
          const up = it.chgPct >= 0;
          return (
            <Link
              key={it.id}
              href={`/market/${it.id}`}
              className="group relative min-w-[280px] sm:min-w-[340px] h-[200px] sm:h-[220px] overflow-hidden rounded-2xl border border-black/10 hover:border-black/20 transition"
            >
              <div
                className="absolute inset-0 bg-cover bg-center group-hover:scale-[1.05] transition duration-500"
                style={{ backgroundImage: `url('${it.thumbnail}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/28 to-black/0" />

              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                <span className="text-[11px] px-2 py-1 rounded-full bg-white/16 border border-white/18 text-white font-medium">
                  {it.tagMain}
                </span>
                {it.annualReturn && (
                  <span className="text-[11px] px-2 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/25 text-emerald-200 font-bold">
                    연 {it.annualReturn}%
                  </span>
                )}
              </div>

              <div className="relative h-full p-4 flex flex-col justify-end text-white">
                <div className="text-[12px] text-white/60">{it.creator} · {it.category}</div>
                <div className="text-[17px] font-extrabold leading-tight mt-0.5">{it.title}</div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="text-[14px] font-extrabold tabular-nums">{formatKRW(it.price)}</div>
                  <div className={`text-[13px] font-extrabold tabular-nums ${up ? 'text-emerald-300' : 'text-red-300'}`}>
                    {up ? '▲' : '▼'} {Math.abs(it.chgPct).toFixed(1)}%
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

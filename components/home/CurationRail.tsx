'use client';

import Link from 'next/link';
import { marketItems } from '@/lib/mock/marketItems';
import { formatKRW } from '@/lib/mock/marketItems';

export default function CurationRail() {
  const curated = marketItems.slice(0, 10);

  return (
    <section id="home-ownership-anchor" className="px-5 sm:px-6 pt-10 sm:pt-12 max-w-7xl mx-auto">
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-[-0.3px]">
            이것의 소유자가 되어보세요.
          </h2>
          <p className="text-sm text-black/55 mt-1">
            오늘 가장 뜨는 콘텐츠 자산을 &quot;소유&quot;해보는 경험
          </p>
        </div>
        <Link href="/market" className="text-sm text-black/55 hover:text-black transition">
          마켓 둘러보기 →
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {curated.map((it) => {
          const up = it.chgPct >= 0;
          return (
            <Link
              key={it.id}
              href={`/market/${it.id}`}
              className="group relative min-w-[280px] sm:min-w-[340px] h-[200px] sm:h-[220px] overflow-hidden rounded-2xl border border-black/10 hover:border-black/20 transition"
            >
              <div
                className="absolute inset-0 bg-cover bg-center group-hover:scale-[1.06] transition"
                style={{ backgroundImage: `url('${it.thumbnail}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/0" />

              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="text-[11px] px-2 py-1 rounded-full bg-white/16 border border-white/18 text-white">
                  {it.tagMain}
                </span>
                <span className="text-[11px] px-2 py-1 rounded-full bg-black/35 border border-white/15 text-white/85">
                  {it.category}
                </span>
              </div>

              <div className="relative h-full p-4 flex flex-col justify-end text-white">
                <div className="text-lg font-extrabold">{it.title}</div>
                <div className="mt-1 flex items-center justify-between">
                  <div className="text-sm text-white/75">{formatKRW(it.price)}</div>
                  <div className={`text-sm font-extrabold tabular-nums ${up ? 'text-emerald-300' : 'text-red-300'}`}>
                    {up ? '+' : ''}{it.chgPct.toFixed(1)}%
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

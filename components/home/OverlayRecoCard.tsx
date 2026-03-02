'use client';

import Link from 'next/link';
import type { MarketItem } from '@/lib/mock/marketItems';
import { formatKRW } from '@/lib/mock/marketItems';

export default function OverlayRecoCard({ item }: { item: MarketItem }) {
  const up = item.chgPct >= 0;
  return (
    <Link
      href={`/market/${item.id}`}
      className="group relative overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_26px_rgba(0,0,0,0.10)] transition block"
    >
      <div
        className="absolute inset-0 bg-cover bg-center scale-[1.02] group-hover:scale-[1.06] transition"
        style={{ backgroundImage: `url('${item.thumbnail}')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/28 to-black/0" />
      <div className="absolute top-3 left-3 flex items-center gap-2">
        <span className="text-[11px] px-2 py-1 rounded-full bg-white/16 border border-white/18 text-white">
          {item.tagMain}
        </span>
        <span className="text-[11px] px-2 py-1 rounded-full bg-black/30 border border-white/12 text-white/85">
          {item.momentum}
        </span>
      </div>

      <div className="relative p-4 pt-24 sm:pt-28 text-white">
        <div className="text-xs text-white/75">
          {item.creator} · {item.category}
        </div>
        <div className="mt-1 text-lg font-extrabold tracking-[-0.2px]">
          {item.title}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-base font-extrabold tabular-nums">
            {formatKRW(item.price)}
          </div>
          <div className={`text-sm font-extrabold tabular-nums ${up ? 'text-emerald-300' : 'text-red-300'}`}>
            {up ? '+' : ''}{item.chgPct.toFixed(1)}%
          </div>
        </div>
      </div>
    </Link>
  );
}

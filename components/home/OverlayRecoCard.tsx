'use client';

import Link from 'next/link';
import type { MarketItem } from '@/lib/mock/marketItems';
import { formatKRW } from '@/lib/mock/marketItems';

export default function OverlayRecoCard({ item }: { item: MarketItem }) {
  const up = item.chgPct >= 0;

  return (
    <Link
      href={`/market/${item.id}`}
      className="group relative overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_26px_rgba(0,0,0,0.12)] transition block"
    >
      {/* 썸네일 배경 */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-[1.02] group-hover:scale-[1.06] transition duration-500"
        style={{ backgroundImage: `url('${item.thumbnail}')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/0" />

      {/* 상단 배지 */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5">
        <span className="text-[11px] px-2 py-1 rounded-full bg-white/16 border border-white/18 text-white font-medium">
          {item.tagMain}
        </span>
      </div>
      {item.annualReturn && (
        <div className="absolute top-3 right-3">
          <span className="text-[11px] px-2 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/25 text-emerald-200 font-bold">
            연 {item.annualReturn}%
          </span>
        </div>
      )}

      <div className="relative p-4 pt-24 sm:pt-28 text-white">
        <div className="text-[11px] text-white/60 leading-snug">
          {item.creator} · {item.category}
        </div>
        <div className="mt-0.5 text-[16px] font-extrabold tracking-[-0.2px] leading-tight">
          {item.title}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-[15px] font-extrabold tabular-nums">{formatKRW(item.price)}</div>
          <div
            className={`text-[13px] font-extrabold tabular-nums ${
              up ? 'text-emerald-300' : 'text-red-300'
            }`}
          >
            {up ? '▲' : '▼'} {Math.abs(item.chgPct).toFixed(1)}%
          </div>
        </div>
      </div>
    </Link>
  );
}

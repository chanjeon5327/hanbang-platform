'use client';

import Link from 'next/link';
import type { MarketItem } from '@/lib/mock/marketItems';
import { formatKRW } from '@/lib/mock/marketItems';

export default function OverlayRecoCard({ item }: { item: MarketItem }) {
  const up = item.chgPct >= 0;

  return (
    <Link
      href={`/market/${item.id}`}
      className="group relative block aspect-[3/4] overflow-hidden rounded-2xl border border-black/10 bg-[#0B1224] shadow-[0_6px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.14)] hover:border-[#2563EB]/30 transition duration-300"
    >
      {/* 썸네일 배경 */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-[1.03] group-hover:scale-[1.08] transition duration-500"
        style={{ backgroundImage: `url('${item.thumbnail}')` }}
      />
      {/* 그라디언트 오버레이 – 하단 강조 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />

      {/* 상단: 태그 배지들 */}
      <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
        <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-white/14 border border-white/18 text-white/90 tracking-wide">
          {item.tagMain}
        </span>
        {item.annualReturn && (
          <span className="text-[10px] font-extrabold px-2 py-1 rounded-full bg-emerald-500/22 border border-emerald-400/28 text-emerald-200">
            연 {item.annualReturn}%
          </span>
        )}
      </div>

      {/* 하단: 콘텐츠 정보 */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="text-[10px] text-white/55 leading-none mb-1">
          {item.creator} · {item.category}
        </div>
        <div className="text-[14px] sm:text-[15px] font-extrabold text-white leading-tight tracking-[-0.01em]">
          {item.title}
        </div>
        <div className="mt-2.5 flex items-center justify-between">
          <div className="text-[14px] font-extrabold text-white tabular-nums">
            {formatKRW(item.price)}
          </div>
          <div
            className={`text-[12px] font-extrabold tabular-nums ${
              up ? 'text-emerald-300' : 'text-red-300'
            }`}
          >
            {up ? '▲' : '▼'} {Math.abs(item.chgPct).toFixed(1)}%
          </div>
        </div>
        {/* 판매 진행률 바 */}
        {item.soldPct !== undefined && (
          <div className="mt-2.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-white/45">판매</span>
              <span className="text-[10px] font-bold text-white/65">{item.soldPct}%</span>
            </div>
            <div className="w-full h-[3px] rounded-full bg-white/15 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#2563EB]"
                style={{ width: `${item.soldPct}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

'use client';

import Link from 'next/link';
import type { MarketItem } from '@/lib/mock/marketItems';
import { formatKRW } from '@/lib/mock/marketItems';

export default function OverlayRecoCard({ item }: { item: MarketItem }) {
  const up = item.chgPct >= 0;

  return (
    <Link
      href={`/market/${item.id}`}
      className="group relative block aspect-[3/4] overflow-hidden rounded-2xl border border-black/10 bg-neutral-200 shadow-[0_6px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.14)] hover:border-[#2563EB]/30 transition duration-300"
    >
      {/* 썸네일 — 원본에 박힌 위/아래 검은 띠를 가리도록 scale + object-cover */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.thumbnail}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center transition duration-500 scale-[1.12] group-hover:scale-[1.18] pointer-events-none"
        loading="lazy"
      />

      {/* 하단에만 가독용 그라데이션 — 위쪽 검은 띠 금지 */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/65 via-black/25 to-transparent pointer-events-none" />

      {/* 상단: 태그 배지들 — bg/border 밝기 보정 */}
      <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
        <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-white/22 border border-white/30 text-white tracking-wide">
          {item.tagMain}
        </span>
        {item.annualReturn && (
          <span className="text-[10px] font-extrabold px-2 py-1 rounded-full bg-emerald-500/32 border border-emerald-400/42 text-emerald-100">
            연 {item.annualReturn}%
          </span>
        )}
      </div>

      {/* 하단: 콘텐츠 정보 */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        {/* creator — white/55 → white/75 */}
        <div className="text-[10px] text-white/75 leading-none mb-1">
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

        {/* 판매 진행률 바 — 라벨/퍼센트 밝기 보정 */}
        {item.soldPct !== undefined && (
          <div className="mt-2.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-white/62">판매</span>
              <span className="text-[10px] font-bold text-white/80">{item.soldPct}%</span>
            </div>
            <div className="w-full h-[3px] rounded-full bg-white/25 overflow-hidden">
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

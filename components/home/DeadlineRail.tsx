'use client';

import Link from 'next/link';
import { marketItems, formatKRW } from '@/lib/mock/marketItems';

const DEADLINE_SLUGS = ['cinema-buster', 'sports-pick', 'k-drama', 'game-lab'] as const;

export default function DeadlineRail() {
  const byId = Object.fromEntries(marketItems.map((it) => [it.id, it]));
  const items = DEADLINE_SLUGS.map((id) => byId[id]).filter(Boolean);

  const fmtLeft = (h: number) => {
    if (h < 1) return `${Math.floor(h * 60)}분`;
    if (h < 24) return `${Math.floor(h)}시간 ${Math.floor((h % 1) * 60)}분`;
    const d = Math.floor(h / 24);
    const hh = Math.floor(h % 24);
    return `${d}일 ${hh}시간`;
  };

  const urgencyPct = (h: number) => Math.max(5, Math.min(100, Math.round((1 - h / 100) * 100)));

  return (
    <section className="px-5 sm:px-6 py-10 sm:py-12 max-w-7xl mx-auto">
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-[-0.3px]">마감 임박</h2>
          <p className="text-sm text-black/55 mt-1">
            청약 마감이 가까운 종목을 놓치지 마세요.
          </p>
        </div>
        <Link href="/market" className="text-sm text-black/60 hover:text-black transition shrink-0">
          전체보기 →
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((it) => (
          <Link
            key={it.id}
            href={`/market/${it.id}`}
            className="group relative min-w-[240px] h-[190px] overflow-hidden rounded-2xl border border-black/10 bg-neutral-200 shadow-[0_6px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_26px_rgba(0,0,0,0.10)] hover:border-black/20 transition"
          >
            {/* 썸네일 — 원본의 위/아래 검은 띠를 가리도록 scale 적용 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={it.thumbnail}
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-center transition duration-500 scale-[1.12] group-hover:scale-[1.18]"
              loading="lazy"
            />

            {/* 하단에만 가독용 그라데이션 — 위쪽 검은 띠 금지 */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/65 via-black/25 to-transparent" />

            {/* 마감 임박 배지 — 밝기 보정 */}
            <div className="absolute top-3 left-3">
              <span className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-400/28 border border-amber-300/45 text-amber-50">
                마감 임박
              </span>
            </div>

            {/* 수익률 배지 — 밝기 보정 */}
            {it.annualReturn && (
              <div className="absolute top-3 right-3">
                <span className="inline-block text-[11px] font-bold px-2 py-1 rounded-full bg-emerald-500/30 border border-emerald-400/42 text-emerald-100">
                  연 {it.annualReturn}%
                </span>
              </div>
            )}

            <div className="relative h-full p-4 flex flex-col justify-end">
              {/* category — white/60 → white/78 */}
              <div className="text-[12px] text-white/78">{it.category}</div>
              <div className="text-[16px] font-extrabold text-white leading-tight">{it.title}</div>
              <div className="text-[13px] font-extrabold tabular-nums text-white/88 mt-1">
                {formatKRW(it.price)}
              </div>

              {/* 잔여 시간 진행바 */}
              <div className="mt-2.5">
                <div className="flex items-center justify-between mb-1">
                  {/* 잔여 라벨 — white/50 → white/68 */}
                  <span className="text-[10px] text-white/68">잔여</span>
                  <span className="text-[12px] font-extrabold text-amber-200 tabular-nums">
                    {fmtLeft(it.deadlineHours ?? 0)}
                  </span>
                </div>
                {/* 바 배경 — bg-white/15 → bg-white/22 */}
                <div className="w-full h-1 rounded-full bg-white/22 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all"
                    style={{ width: `${urgencyPct(it.deadlineHours ?? 0)}%` }}
                  />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

'use client';

import Link from 'next/link';
import { HbBadge } from '@/components/ui/HbBadge';
import { marketItems } from '@/lib/mock/marketItems';

export default function DeadlineRail() {
  const items = [...marketItems]
    .filter(x => typeof x.deadlineHours === 'number')
    .sort((a,b) => (a.deadlineHours ?? 999) - (b.deadlineHours ?? 999))
    .slice(0, 10);

  const fmtLeft = (h: number) => {
    if (h < 24) return `${Math.floor(h)}시간 ${Math.floor((h%1)*60)}분`;
    const d = Math.floor(h/24);
    const hh = Math.floor(h%24);
    return `${d}일 ${hh}시간`;
  };

  return (
    <section className="px-5 sm:px-6 py-10 sm:py-12 max-w-7xl mx-auto">
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-[-0.3px]">마감 임박</h2>
          <p className="text-sm text-black/55 mt-1">카드 뒤 썸네일 + 오버레이 + 즉시 진입</p>
        </div>
        <Link href="/market" className="text-sm text-black/60 hover:text-black transition">전체보기 →</Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((it) => (
          <Link
            key={it.id}
            href={`/market/${it.id}`}
            className="group relative min-w-[240px] h-[180px] overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_6px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_26px_rgba(0,0,0,0.10)] transition"
          >
            <div className="absolute inset-0 bg-cover bg-center group-hover:scale-[1.06] transition"
              style={{ backgroundImage: `url('${it.thumbnail}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/0" />
            <div className="absolute top-3 left-3">
              <HbBadge variant="warning" className="!bg-amber-300/15 !border-amber-200/20 !text-amber-100">
                마감 임박
              </HbBadge>
            </div>

            <div className="relative h-full p-4 flex flex-col justify-end">
              <div className="text-sm text-white/70">{it.category}</div>
              <div className="text-lg font-extrabold">{it.title}</div>
              <div className="mt-2 flex items-center justify-between">
                <div className="text-xs text-white/55">잔여</div>
                <div className="text-sm font-extrabold text-amber-200 tabular-nums">
                  {fmtLeft(it.deadlineHours ?? 0)}
                </div>
              </div>
              <div className="mt-3 w-full rounded-xl bg-[#2563EB] group-hover:bg-[#1D4ED8] py-2 text-sm font-extrabold text-center transition">
                상세로 이동
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

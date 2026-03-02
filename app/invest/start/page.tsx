'use client';

import Link from 'next/link';
import { marketItems, formatKRW } from '@/lib/mock/marketItems';

export default function InvestStartPage() {
  // "청약/마감" 느낌: deadlineHours 있는 것 우선 노출
  const items = [...marketItems]
    .sort((a, b) => (a.deadlineHours ?? 9999) - (b.deadlineHours ?? 9999))
    .slice(0, 20);

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#0B1120]">
      <header className="max-w-7xl mx-auto px-5 sm:px-6 pt-10 pb-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-[-0.4px]">지금 투자 시작</h1>
            <p className="text-sm text-black/60 mt-2">
              마감이 있는 종목 중심으로 먼저 보여드립니다. (청약 참여 → 보유 → 수익 배분 → 2차 거래)
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/" className="px-4 py-3 rounded-xl bg-white border border-black/10 hover:bg-black/5 text-sm font-bold transition">
              홈으로
            </Link>
            <Link href="/market" className="px-4 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-extrabold transition">
              마켓 둘러보기
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 sm:px-6 pb-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {items.map((it) => {
            const up = it.chgPct >= 0;
            return (
              <Link
                key={it.id}
                href={`/market/${it.id}`}
                className="group overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_6px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_26px_rgba(0,0,0,0.10)] transition"
              >
                <div className="h-[140px] bg-cover bg-center group-hover:scale-[1.03] transition" style={{ backgroundImage: `url('${it.thumbnail}')` }} />
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] px-2 py-1 rounded-full bg-black/5 border border-black/10">
                      {it.tagMain}
                    </span>
                    <span className="text-[11px] px-2 py-1 rounded-full bg-black/5 border border-black/10 text-black/60">
                      {typeof it.deadlineHours === 'number' ? '마감임박' : it.momentum}
                    </span>
                  </div>

                  <div className="mt-3 text-sm text-black/60">{it.creator} · {it.category}</div>
                  <div className="mt-1 text-base font-extrabold">{it.title}</div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="font-extrabold tabular-nums">{formatKRW(it.price)}</div>
                    <div className={`text-sm font-extrabold tabular-nums ${up ? 'text-emerald-600' : 'text-red-500'}`}>
                      {up ? '+' : ''}{it.chgPct.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}

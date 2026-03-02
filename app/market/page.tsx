'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import FloatingSupportBubble from '@/components/common/FloatingSupportBubble';
import { marketItems, formatKRW, type MarketItem } from '@/lib/mock/marketItems';

const cats = ['전체', '여행', '먹방', '시사/토크', '스포츠', '드라마', '음악', '영화', '코미디', '게임', '교양', '키즈', '뷰티', '다큐', '토크'];

function chipMomentum(m: MarketItem['momentum']) {
  if (m === '급상승') return 'text-emerald-600';
  if (m === '급락주의') return 'text-red-500';
  if (m === '상승') return 'text-emerald-600';
  if (m === '하락') return 'text-red-500';
  return 'text-black/60';
}

export default function MarketPage() {
  const [cat, setCat] = useState('전체');

  const items = useMemo(() => {
    const base = marketItems;
    return cat === '전체' ? base : base.filter(x => x.category === cat);
  }, [cat]);

  const deadlines = useMemo(() => {
    return [...marketItems].filter(x => typeof x.deadlineHours === 'number').slice(0, 12);
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#0B1120]">
      <header className="max-w-7xl mx-auto px-5 sm:px-6 pt-10 pb-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-[-0.4px]">마켓 둘러보기</h1>
            <p className="text-sm text-black/60 mt-2">모두의 추천 · 마감 임박 · 나의 관심 · 카테고리</p>
          </div>
          <Link href="/" className="text-sm text-black/60 hover:text-black transition">홈으로 →</Link>
        </div>

        <div className="mt-6 flex gap-2 flex-wrap">
          {cats.map(c => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-3 py-2 rounded-full text-sm border transition ${
                cat === c ? 'bg-[#2563EB] border-[#2563EB] text-white font-extrabold' : 'bg-white border-black/10 text-black/70 hover:bg-black/5'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </header>

      {/* 모두의 추천 */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 pb-10">
        <div className="flex items-end justify-between mb-5">
          <h2 className="text-xl font-extrabold">모두의 추천</h2>
          <div className="text-xs text-black/45">샘플 20개</div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {items.slice(0, 20).map((it) => {
            const up = it.chgPct >= 0;
            return (
              <Link key={it.id} href={`/market/${it.id}`} className="group overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_6px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_26px_rgba(0,0,0,0.10)] transition">
                <div className="h-[140px] bg-cover bg-center group-hover:scale-[1.03] transition"
                  style={{ backgroundImage: `url('${it.thumbnail}')` }}
                />
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] px-2 py-1 rounded-full bg-black/5 border border-black/10">{it.tagMain}</span>
                    <span className={`text-[11px] px-2 py-1 rounded-full bg-black/5 border border-black/10 ${chipMomentum(it.momentum)}`}>
                      {it.momentum}
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
      </section>

      {/* 전체 마감 임박 */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 pb-12">
        <div className="flex items-end justify-between mb-5">
          <h2 className="text-xl font-extrabold">전체 마감 임박</h2>
          <span className="text-xs text-black/45">썸네일+오버레이</span>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {deadlines.map((it) => (
            <Link key={it.id} href={`/market/${it.id}`} className="group relative min-w-[260px] h-[170px] rounded-2xl border border-black/10 overflow-hidden shadow-[0_6px_20px_rgba(0,0,0,0.05)]">
              <div className="absolute inset-0 bg-cover bg-center group-hover:scale-[1.05] transition" style={{ backgroundImage: `url('${it.thumbnail}')` }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/0" />
              <div className="relative h-full p-4 flex flex-col justify-end text-white">
                <div className="text-xs text-white/70">{it.category}</div>
                <div className="text-lg font-extrabold">{it.title}</div>
                <div className="mt-2 text-sm text-amber-200 font-extrabold">마감 임박</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="px-6 py-10 text-center text-xs text-black/45">
        © HANBANG. All rights reserved.
      </footer>

      <FloatingSupportBubble />
    </div>
  );
}

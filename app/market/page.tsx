'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, LayoutGrid, List } from 'lucide-react';
import { marketItems, formatKRW, type MarketItem } from '@/lib/mock/marketItems';
import MarketMiniChart from '@/components/charts/MarketMiniChart';

const CATS = ['전체', '여행', '먹방', '시사/토크', '스포츠', '드라마', '음악', '영화', '코미디', '게임', '교양', '키즈', '뷰티', '다큐', '토크'];

const SORT_OPTIONS = [
  { value: 'popular', label: '인기순' },
  { value: 'price_asc', label: '가격 낮은순' },
  { value: 'price_desc', label: '가격 높은순' },
  { value: 'chg_desc', label: '등락률순' },
  { value: 'chg_asc', label: '하락순' },
] as const;

type SortKey = (typeof SORT_OPTIONS)[number]['value'];

function chipMomentum(m: MarketItem['momentum']) {
  if (m === '급상승') return 'text-emerald-600';
  if (m === '급락주의') return 'text-red-500';
  if (m === '상승') return 'text-emerald-600';
  if (m === '하락') return 'text-red-500';
  return 'text-black/60';
}

function MarketCard({ it, view }: { it: MarketItem; view: 'grid' | 'list' }) {
  const up = it.chgPct >= 0;
  const cardContent = (
    <>
      {view === 'grid' ? (
        <div className="relative h-[140px] w-full shrink-0 overflow-hidden bg-neutral-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={it.thumbnail}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center scale-[1.04] transition group-hover:scale-[1.08]"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="relative h-[100px] w-[140px] shrink-0 overflow-hidden bg-neutral-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={it.thumbnail}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center scale-[1.04] transition group-hover:scale-[1.08]"
            loading="lazy"
          />
        </div>
      )}
        <div className={view === 'grid' ? 'p-4' : 'p-3 flex-1 min-w-0'}>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-[11px] px-2 py-1 rounded-full bg-black/5 border border-black/10 shrink-0">
            {it.tagMain}
          </span>
          <span
            className={`text-[11px] px-2 py-1 rounded-full bg-black/5 border border-black/10 shrink-0 ${chipMomentum(it.momentum)}`}
          >
            {it.momentum}
          </span>
        </div>
        <div className={`${view === 'grid' ? 'mt-3' : 'mt-2'} text-sm text-black/60 truncate`}>
          {it.creator} · {it.category}
        </div>
        <div className={`${view === 'grid' ? 'mt-1' : 'mt-0.5'} text-base font-extrabold truncate`}>{it.title}</div>
        {/* 미니 스파크라인 (그리드뷰 전용) */}
        {view === 'grid' && (
          <div className="mt-2 -mx-1">
            <MarketMiniChart seed={it.id} basePrice={it.price} up={up} height={36} />
          </div>
        )}
        <div className={`${view === 'grid' ? 'mt-1.5' : 'mt-2'} flex items-center justify-between gap-2`}>
          <div className="font-extrabold tabular-nums">{formatKRW(it.price)}</div>
          <div className={`text-sm font-extrabold tabular-nums shrink-0 ${up ? 'text-[#1565C0]' : 'text-[#C62828]'}`}>
            {up ? '▲' : '▼'} {Math.abs(it.chgPct).toFixed(2)}%
          </div>
        </div>
      </div>
    </>
  );

  if (view === 'list') {
    return (
      <Link
        href={`/market/${it.id}`}
        className="group flex overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_6px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_26px_rgba(0,0,0,0.10)] transition"
      >
        {cardContent}
      </Link>
    );
  }

  return (
    <Link
      href={`/market/${it.id}`}
      className="group grid overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_6px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_26px_rgba(0,0,0,0.10)] transition"
    >
      {cardContent}
    </Link>
  );
}

export default function MarketPage() {
  const [cat, setCat] = useState('전체');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('popular');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const items = useMemo(() => {
    let list = [...marketItems];
    if (cat !== '전체') list = list.filter((x) => x.category === cat);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (x) =>
          x.title.toLowerCase().includes(q) ||
          x.creator.toLowerCase().includes(q) ||
          x.category.toLowerCase().includes(q)
      );
    }
    if (sort === 'price_asc') list.sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') list.sort((a, b) => b.price - a.price);
    else if (sort === 'chg_desc') list.sort((a, b) => b.chgPct - a.chgPct);
    else if (sort === 'chg_asc') list.sort((a, b) => a.chgPct - b.chgPct);
    else list.sort((a, b) => b.price - a.price);
    return list;
  }, [cat, search, sort]);

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#0B1120]">
      <header className="max-w-7xl mx-auto px-5 sm:px-6 pt-10 pb-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-[-0.4px]">마켓</h1>
            <p className="text-sm text-black/60 mt-2">종목 탐색 · 검색 · 필터 · 정렬</p>
          </div>
          <Link href="/" className="text-sm text-black/60 hover:text-black transition shrink-0">
            홈으로 →
          </Link>
        </div>

        <div className="mt-6 flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
            <input
              type="text"
              placeholder="제목, 크리에이터, 카테고리 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-4 rounded-xl border border-black/10 bg-white text-black placeholder:text-black/40 text-sm font-medium outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="px-4 py-4 rounded-xl border border-black/10 bg-white text-black text-sm font-medium outline-none focus:border-[#2563EB] shrink-0"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <div className="flex rounded-xl border border-black/10 bg-white p-1 shrink-0">
            <button
              type="button"
              onClick={() => setView('grid')}
              className={`p-2 rounded-lg transition ${view === 'grid' ? 'bg-[#2563EB] text-white' : 'text-black/60 hover:text-black'}`}
              aria-label="그리드 보기"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              type="button"
              onClick={() => setView('list')}
              className={`p-2 rounded-lg transition ${view === 'list' ? 'bg-[#2563EB] text-white' : 'text-black/60 hover:text-black'}`}
              aria-label="리스트 보기"
            >
              <List size={18} />
            </button>
          </div>
        </div>

        <div className="mt-4 flex gap-2 flex-wrap">
          {CATS.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-3 py-2 rounded-full text-sm border transition shrink-0 ${
                cat === c ? 'bg-[#2563EB] border-[#2563EB] text-white font-extrabold' : 'bg-white border-black/10 text-black/70 hover:bg-black/5'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-5 sm:px-6 pb-12">
        <div className="flex items-end justify-between mb-5">
          <h2 className="text-xl font-extrabold">
            {search.trim() ? `검색 결과: "${search}"` : cat === '전체' ? '전체 종목' : cat}
          </h2>
          <span className="text-xs text-black/45">{items.length}개</span>
        </div>

        {items.length === 0 ? (
          <div className="py-16 text-center text-black/50">
            <p className="text-sm font-medium">검색 결과가 없습니다.</p>
            <p className="text-xs mt-2">검색어나 필터를 변경해 보세요.</p>
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {items.map((it) => (
              <MarketCard key={it.id} it={it} view="grid" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {items.map((it) => (
              <MarketCard key={it.id} it={it} view="list" />
            ))}
          </div>
        )}
      </section>

      <footer className="px-6 py-10 text-center text-xs text-black/45">
        © HANBANG. All rights reserved.
      </footer>
    </div>
  );
}

'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import MarketGridCard from '@/components/market/MarketGridCard';
import { useMarketTab, type RailItem } from '@/hooks/useMarketTab';
import { useMemo, useState, useEffect } from 'react';

const TABS = [
  { key: 'all', label: '전체' },
  { key: 'popular', label: '모두의 추천' },
  { key: 'deadline', label: '마감임박' },
  { key: 'my', label: '나의 관심' },
  { key: 'category', label: '카테고리' },
] as const;

const SORT_OPTIONS = [
  { value: 'recommendation', label: '추천' },
  { value: 'progress', label: '모집률' },
  { value: 'deadline', label: '마감순' },
  { value: 'participants', label: '참여수' },
] as const;

export default function MarketPage() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const tab = searchParams.get('tab') ?? 'popular';
  const category = searchParams.get('category');
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState<string>('recommendation');
  const [artistKeyword, setArtistKeyword] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ categories: string[]; artist_keywords: string[] }>({ categories: [], artist_keywords: [] });

  useEffect(() => {
    fetch('/api/market/filters', { cache: 'no-store' })
      .then((r) => r.json())
      .then((j) => setFilters({ categories: j.categories ?? [], artist_keywords: j.artist_keywords ?? [] }))
      .catch(() => {});
  }, []);

  const effectiveTab = tab === 'my' && !user ? 'all' : tab;
  const effectiveSort = effectiveTab === 'deadline' ? 'deadline' : sort;
  const { items, loading, nextCursor, loadMore } = useMarketTab(
    effectiveTab,
    tab === 'category' ? category : null,
    !!user,
    effectiveSort,
    artistKeyword
  );

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase().trim();
    return items.filter((i) => {
      const title = (i.title ?? '').toLowerCase();
      const creator = (i.creator_name ?? '').toLowerCase();
      const cat = (i.category ?? '').toLowerCase();
      return title.includes(q) || creator.includes(q) || cat.includes(q);
    });
  }, [items, searchQuery]);

  const showMyTab = !!user;
  const isEmpty = !loading && filteredItems.length === 0;
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);

  return (
    <div className="min-h-screen pb-8" style={{ backgroundColor: 'var(--toss-bg)' }}>
      <header className="sticky top-0 z-50 bg-[var(--toss-card)] border-b border-black/5">
        <div className="flex items-center h-14 px-4 max-w-lg mx-auto gap-2">
          <Link href="/" className="p-2 -ml-2 rounded-xl" style={{ color: 'var(--toss-text-secondary)' }} aria-label="뒤로">
            <ArrowLeft size={24} strokeWidth={2} />
          </Link>
          <h1 className="flex-1 text-center text-[17px] font-bold" style={{ color: 'var(--toss-text)' }}>수익권 마켓</h1>
          <div className="w-10" />
        </div>
        <div className="px-4 pb-3">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--toss-text-secondary)' }} />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="작품명, 크리에이터명 검색"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--toss-blue)]"
              style={{ backgroundColor: 'var(--toss-bg)', borderColor: 'var(--toss-border)', color: 'var(--toss-text)' }}
              aria-label="작품명, 크리에이터명 검색"
            />
          </div>
        </div>

        {/* SortDropdown */}
        <div className="px-4 py-2 border-b border-black/5">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full max-w-[140px] px-3 py-2 rounded-lg text-[13px] font-medium border"
            style={{ backgroundColor: 'var(--toss-bg)', color: 'var(--toss-text)', borderColor: 'var(--toss-border)' }}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* 탭 */}
        <div className="flex overflow-x-auto no-scrollbar gap-1 px-4 pb-2 border-b border-black/5">
          {TABS.filter((t) => t.key !== 'my' || showMyTab).map((t) => (
            <Link
              key={t.key}
              href={t.key === 'category' ? '/market?tab=category' : `/market?tab=${t.key}`}
              className={`shrink-0 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition ${
                tab === t.key ? 'bg-[var(--toss-blue)] text-white' : 'text-[var(--toss-text-secondary)] hover:bg-black/5'
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>

        {/* 필터 칩: 카테고리 + artist_keyword */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 px-4 py-3 border-b border-black/5">
          {filters.categories.map((c) => (
            <Link
              key={c}
              href={`/market?tab=category&category=${encodeURIComponent(c)}`}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-[12px] font-medium transition ${
                category === c ? 'bg-[var(--toss-blue)] text-white' : 'bg-black/5 text-[var(--toss-text-secondary)] hover:bg-black/10'
              }`}
            >
              {c}
            </Link>
          ))}
          {filters.artist_keywords.map((kw) => (
            <button
              key={kw}
              type="button"
              onClick={() => setArtistKeyword(artistKeyword === kw ? null : kw)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-[12px] font-medium transition ${
                artistKeyword === kw ? 'bg-[#C5A059] text-black' : 'bg-black/5 text-[var(--toss-text-secondary)] hover:bg-black/10'
              }`}
            >
              {kw}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4 pb-8">
        {loading && items.length === 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-[4/5] rounded-2xl bg-black/5 animate-pulse" />
            ))}
          </div>
        ) : isEmpty ? (
          <EmptyState tab={effectiveTab} isLoggedIn={!!user} />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              {filteredItems.map((item: RailItem, i: number) => (
                <MarketGridCard
                  key={item.id}
                  item={item}
                  index={i}
                  showDeadlineBadge={effectiveTab === 'deadline'}
                  activePreviewId={activePreviewId}
                  onPreviewActive={setActivePreviewId}
                />
              ))}
            </div>
            {nextCursor != null && !searchQuery && (
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loading}
                  className="px-6 py-3 rounded-xl text-[14px] font-semibold disabled:opacity-50"
                  style={{ backgroundColor: 'var(--toss-blue)', color: '#fff' }}
                >
                  {loading ? '로딩 중...' : '더보기'}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function EmptyState({ tab, isLoggedIn }: { tab: string; isLoggedIn: boolean }) {
  if (tab === 'my') {
    return (
      <div className="py-16 text-center">
        <p className="text-[15px] font-medium" style={{ color: 'var(--toss-text)' }}>
          관심이 없습니다
        </p>
        <p className="text-[13px] mt-2" style={{ color: 'var(--toss-text-secondary)' }}>
          홈에서 관심 버튼을 눌러주세요
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl text-[14px] font-semibold"
            style={{ backgroundColor: 'var(--toss-blue)', color: '#fff' }}
          >
            홈으로
          </Link>
          <Link
            href="/market?tab=popular"
            className="px-6 py-3 rounded-xl text-[14px] font-semibold border"
            style={{ borderColor: 'var(--toss-border)', color: 'var(--toss-text)' }}
          >
            인기 보러가기
          </Link>
        </div>
      </div>
    );
  }
  if (tab === 'deadline') {
    return (
      <div className="py-16 text-center">
        <p className="text-[15px] font-medium" style={{ color: 'var(--toss-text)' }}>
          마감 예정이 없습니다
        </p>
      </div>
    );
  }
  return (
    <div className="py-16 text-center">
      <p className="text-[15px] font-medium" style={{ color: 'var(--toss-text-secondary)' }}>
        조건에 맞는 수익권이 없습니다
      </p>
    </div>
  );
}

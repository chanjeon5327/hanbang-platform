'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import CardV5MarketCard from '@/components/market/CardV5MarketCard';
import TopAppBar from '@/components/ui/TopAppBar';
import { HBCardSkeleton } from '@/components/ui/HBSkeleton';
import { useMarketTab, type RailItem } from '@/hooks/useMarketTab';
import { useMemo, useState, useEffect, Suspense } from 'react';

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

function MarketPageContent() {
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
    <div className="pb-8" style={{ backgroundColor: 'var(--bg)' }}>
      <TopAppBar title="수익권 마켓" backHref="/" />
      <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="작품명, 크리에이터명 검색"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border body-sm focus:outline-none focus:ring-2 focus:ring-[var(--royal-blue)]"
            style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
            aria-label="작품명, 크리에이터명 검색"
          />
        </div>
      </div>

      <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="w-full max-w-[140px] px-3 py-2 rounded-xl body-sm font-medium border"
          style={{ backgroundColor: 'var(--bg)', color: 'var(--text)', borderColor: 'var(--border)' }}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="flex overflow-x-auto no-scrollbar gap-2 px-4 py-3 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)', gap: 'var(--space-md)' }}>
        {TABS.filter((t) => t.key !== 'my' || showMyTab).map((t) => (
          <Link
            key={t.key}
            href={t.key === 'category' ? '/market?tab=category' : `/market?tab=${t.key}`}
            className={`shrink-0 px-4 h-8 flex items-center rounded-xl body-sm font-semibold transition ${
              tab === t.key ? 'text-white' : 'hover:opacity-80'
            }`}
            style={{
              backgroundColor: tab === t.key ? 'var(--royal-blue)' : 'var(--bg-secondary)',
              color: tab === t.key ? '#fff' : 'var(--text-secondary)',
            }}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="flex overflow-x-auto no-scrollbar gap-2 px-4 py-3 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
        {filters.categories.map((c) => (
          <Link
            key={c}
            href={`/market?tab=category&category=${encodeURIComponent(c)}`}
            className={`shrink-0 px-3 py-1.5 rounded-xl caption font-medium transition ${
              category === c ? 'text-white' : 'hover:opacity-80'
            }`}
            style={{
              backgroundColor: category === c ? 'var(--royal-blue)' : 'var(--bg-secondary)',
              color: category === c ? '#fff' : 'var(--text-secondary)',
            }}
          >
            {c}
          </Link>
        ))}
        {filters.artist_keywords.map((kw) => (
          <button
            key={kw}
            type="button"
            onClick={() => setArtistKeyword(artistKeyword === kw ? null : kw)}
            className={`shrink-0 px-3 py-1.5 rounded-xl caption font-medium transition ${
              artistKeyword === kw ? 'text-black' : 'hover:opacity-80'
            }`}
            style={{
              backgroundColor: artistKeyword === kw ? '#C5A059' : 'var(--bg-secondary)',
              color: artistKeyword === kw ? '#000' : 'var(--text-secondary)',
            }}
          >
            {kw}
          </button>
        ))}
      </div>

      <div className="pt-4 pb-8 px-4" style={{ paddingTop: 'var(--space-lg)' }}>
        {loading && items.length === 0 ? (
          <div className="grid grid-cols-2 hb-stagger" style={{ gap: 'var(--space-md)' }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <HBCardSkeleton key={i} />
            ))}
          </div>
        ) : isEmpty ? (
          <EmptyState tab={effectiveTab} isLoggedIn={!!user} />
        ) : (
          <>
            <div className="grid grid-cols-2 hb-stagger" style={{ gap: 'var(--space-md)' }}>
              {filteredItems.map((item: RailItem, i: number) => (
                <CardV5MarketCard
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
              <div className="text-center" style={{ marginTop: 'var(--space-lg)' }}>
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loading}
                  className="px-6 py-3 rounded-xl body-sm font-semibold disabled:opacity-50"
                  style={{ backgroundColor: 'var(--royal-blue)', color: '#fff' }}
                >
                  {loading ? '로딩 중...' : '더보기'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function MarketPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="animate-pulse body-sm" style={{ color: 'var(--text-secondary)' }}>로딩 중...</div>
      </div>
    }>
      <MarketPageContent />
    </Suspense>
  );
}

function EmptyState({ tab, isLoggedIn }: { tab: string; isLoggedIn: boolean }) {
  if (tab === 'my') {
    return (
      <div className="py-16 text-center">
        <p className="body font-medium" style={{ color: 'var(--text)' }}>
          관심이 없습니다
        </p>
        <p className="body-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
          홈에서 관심 버튼을 눌러주세요
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center" style={{ marginTop: 'var(--space-lg)' }}>
          <Link
            href="/"
            className="px-6 py-3 rounded-xl body-sm font-semibold"
            style={{ backgroundColor: 'var(--royal-blue)', color: '#fff' }}
          >
            홈으로
          </Link>
          <Link
            href="/market?tab=popular"
            className="px-6 py-3 rounded-xl body-sm font-semibold border"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
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
        <p className="body font-medium" style={{ color: 'var(--text)' }}>
          마감 예정이 없습니다
        </p>
      </div>
    );
  }
  return (
    <div className="py-16 text-center">
      <p className="body font-medium" style={{ color: 'var(--text-secondary)' }}>
        조건에 맞는 수익권이 없습니다
      </p>
    </div>
  );
}

'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';
import { getYtThumb } from '@/lib/thumbnails';
import MarketFilterBar, { type MarketFilters, DEFAULT_FILTERS } from '@/components/market/MarketFilterBar';
import MarketCard, { type MarketCardItem } from '@/components/market/MarketCard';
import { useDebounce } from '@/hooks/useDebounce';
import { usePersonalizedSort } from '@/hooks/usePersonalizedSort';

const RAIL_KEYS = [
  'recommend',
  'closing',
  'popular',
  'new',
  'high_yield',
  'stable',
  'theme',
] as const;

const RAIL_TITLES: Record<(typeof RAIL_KEYS)[number], string> = {
  recommend: '오늘의 추천',
  closing: '마감 임박',
  popular: '인기 수익권',
  new: '신규 상장',
  high_yield: '고수익 예상',
  stable: '안정형',
  theme: '테마',
};

const RAIL_GAP = 16;
const CARD_W = 160;

type ApiItem = { id: string; title: string; creator_name?: string; category?: string; thumbnail_url?: string; price?: number; change?: number };
function enrichItem(raw: ApiItem, idx: number): MarketCardItem {
  const prices = [12300, 9800, 15500, 22000, 11800, 18500, 26500, 8900];
  const changes = [3.2, -1.1, 5.4, 2.8, 0.5, -2.3, 8.1, 1.2];
  const revenues = ['광고', '구독', '공연', '저작권', '광고', '광고', '저작권', '구독'];
  const risks: ('low' | 'mid' | 'high')[] = ['low', 'mid', 'high', 'mid', 'low', 'high', 'mid', 'low'];
  const progressArr = [0, 85, 72, 0, 45, 90, 0, 60];
  const remainingArr = ['', 'D-3', 'D-12', '', 'D-20', 'D-1', '', 'D-7'];
  const types: ('mobilization' | 'secondary')[] = ['secondary', 'mobilization', 'mobilization', 'secondary', 'mobilization', 'mobilization', 'secondary', 'mobilization'];
  const i = idx % 8;
  return {
    ...raw,
    price: raw.price ?? prices[i],
    change: raw.change ?? changes[i],
    revenueBadge: revenues[i],
    risk: risks[i],
    progress: progressArr[i],
    remainingText: remainingArr[i] || undefined,
    type: types[i],
    summary: `${raw.title}의 수익권입니다. ${revenues[i]} 수익 기반.`,
  };
}

const FALLBACK_ITEMS: MarketCardItem[] = [
  { id: 'sample-1', title: '여행가 제이', creator_name: '유튜브', category: '여행', thumbnail_url: getYtThumb(0), price: 12300, change: 3.2, revenueBadge: '광고', risk: 'low', progress: 0, type: 'secondary', summary: '유튜브 광고 수익 기반 수익권' },
  { id: 'sample-2', title: '먹방 로드', creator_name: '유튜브', category: '먹방', thumbnail_url: getYtThumb(1), price: 9800, change: -1.1, revenueBadge: '구독', risk: 'mid', progress: 85, remainingText: 'D-3', type: 'mobilization', summary: '구독 수익 기반 마감 임박' },
  { id: 'sample-3', title: '일상 브이로그', creator_name: '유튜브', category: '일상', thumbnail_url: getYtThumb(2), price: 15500, change: 5.4, revenueBadge: '공연', risk: 'high', progress: 72, remainingText: 'D-12', type: 'mobilization', summary: '공연 수익 기반' },
  { id: 'sample-4', title: '웹툰 작가 A', creator_name: '웹툰', category: '웹툰', thumbnail_url: getYtThumb(3), price: 22000, change: 2.8, revenueBadge: '저작권', risk: 'mid', progress: 0, type: 'secondary', summary: '웹툰 저작권 수익' },
  { id: 'sample-5', title: '웹소설 작가 B', creator_name: '웹소설', category: '웹소설', thumbnail_url: getYtThumb(4), price: 11800, change: 0.5, revenueBadge: '광고', risk: 'low', progress: 45, remainingText: 'D-20', type: 'mobilization', summary: '웹소설 광고 수익' },
  { id: 'sample-6', title: '뮤직 비디오 프로젝트', creator_name: '음악', category: '음악', thumbnail_url: getYtThumb(5), price: 18500, change: -2.3, revenueBadge: '광고', risk: 'high', progress: 90, remainingText: 'D-1', type: 'mobilization', summary: '음원 수익 마감 임박' },
  { id: 'sample-7', title: '드라마 리메이크', creator_name: 'OTT', category: '드라마', thumbnail_url: getYtThumb(6), price: 26500, change: 8.1, revenueBadge: '저작권', risk: 'mid', progress: 0, type: 'secondary', summary: '드라마 저작권 수익' },
  { id: 'sample-8', title: '팟캐스트 시즌2', creator_name: '오디오', category: '팟캐스트', thumbnail_url: getYtThumb(7), price: 8900, change: 1.2, revenueBadge: '구독', risk: 'low', progress: 60, remainingText: 'D-7', type: 'mobilization', summary: '팟캐스트 구독 수익' },
  { id: 'sample-9', title: '유튜브 크리에이터 C', creator_name: '유튜브', category: '유튜브', thumbnail_url: getYtThumb(8), price: 14200, change: 4.2, revenueBadge: '광고', risk: 'low', progress: 30, type: 'mobilization', summary: '유튜브 광고 수익' },
  { id: 'sample-10', title: '음원 아티스트 D', creator_name: '음원', category: '음원', thumbnail_url: getYtThumb(9), price: 19800, change: -0.8, revenueBadge: '저작권', risk: 'mid', progress: 0, type: 'secondary', summary: '스트리밍 저작권 수익' },
];

function applyFilters(items: MarketCardItem[], filters: MarketFilters): MarketCardItem[] {
  let result = [...items];

  if (filters.category !== 'all') {
    result = result.filter((i) => (i.category ?? i.creator_name ?? '') === filters.category);
  }
  if (filters.risk !== 'all') {
    result = result.filter((i) => (i.risk ?? 'mid') === filters.risk);
  }
  if (filters.revenueStructure !== 'all') {
    result = result.filter((i) => (i.revenueBadge ?? '') === filters.revenueStructure);
  }
  if (filters.type !== 'all') {
    result = result.filter((i) => (i.type ?? 'secondary') === filters.type);
  }
  if (filters.closingSoon) {
    result = result.filter((i) => !!i.remainingText && i.remainingText.startsWith('D-'));
  }

  switch (filters.sort) {
    case 'price_asc':
      result.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
      break;
    case 'price_desc':
      result.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
      break;
    case 'newest':
      result.sort((a, b) => (b as { created_at?: string }).created_at?.localeCompare((a as { created_at?: string }).created_at ?? '') ?? 0);
      break;
    case 'change_desc':
      result.sort((a, b) => (b.change ?? 0) - (a.change ?? 0));
      break;
    default:
      break;
  }

  return result;
}

function filterBySearch(items: MarketCardItem[], q: string): MarketCardItem[] {
  if (!q.trim()) return items;
  const lower = q.toLowerCase().trim();
  return items.filter((i) => {
    const title = (i.title ?? '').toLowerCase();
    const creator = (i.creator_name ?? '').toLowerCase();
    const category = (i.category ?? '').toLowerCase();
    const tags = (i.tags ?? []).join(' ').toLowerCase();
    return title.includes(lower) || creator.includes(lower) || category.includes(lower) || tags.includes(lower);
  });
}

function buildRails(allItems: MarketCardItem[]): Record<(typeof RAIL_KEYS)[number], MarketCardItem[]> {
  const closing = allItems.filter((i) => i.remainingText && i.progress && i.progress >= 70);
  const popular = [...allItems].sort((a, b) => (b.change ?? 0) - (a.change ?? 0)).slice(0, 8);
  const newItems = [...allItems].slice(0, 6);
  const highYield = allItems.filter((i) => (i.change ?? 0) >= 5).slice(0, 6);
  const stable = allItems.filter((i) => (i.risk ?? 'mid') === 'low').slice(0, 6);
  const themeYt = allItems.filter((i) => (i.category ?? i.creator_name ?? '').includes('유튜브')).slice(0, 6);
  const themeMusic = allItems.filter((i) => (i.category ?? i.creator_name ?? '').includes('음원') || (i.category ?? '').includes('음악')).slice(0, 4);
  const themeWebtoon = allItems.filter((i) => (i.category ?? i.creator_name ?? '').includes('웹툰')).slice(0, 4);
  const theme = [...themeYt, ...themeMusic, ...themeWebtoon].slice(0, 8);

  return {
    recommend: allItems.slice(0, 8),
    closing: closing.length > 0 ? closing : allItems.filter((i) => i.progress).slice(0, 4),
    popular,
    new: newItems,
    high_yield: highYield.length > 0 ? highYield : allItems.slice(0, 6),
    stable,
    theme,
  };
}

export default function MarketPage() {
  const [items, setItems] = useState<MarketCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<MarketFilters>(DEFAULT_FILTERS);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    fetch('/api/home/rails', { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        if (json?.rails?.length > 0) {
          const all: MarketCardItem[] = [];
          let idx = 0;
          json.rails.forEach((r: { items?: Array<{ id: string; title: string; creator_name?: string; category?: string; thumbnail_url?: string }> }) => {
            (r.items ?? []).forEach((it: ApiItem) => {
              all.push(enrichItem(it, idx++));
            });
          });
          if (all.length > 0) setItems(all);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const baseItems = loading || items.length === 0 ? FALLBACK_ITEMS : items;
  const searchFiltered = useMemo(() => filterBySearch(baseItems, debouncedSearch), [baseItems, debouncedSearch]);
  const filterApplied = useMemo(() => applyFilters(searchFiltered, filters), [searchFiltered, filters]);
  const personalizedRecommend = usePersonalizedSort(filterApplied, undefined, { scoreField: 'score' });
  const rails = useMemo(() => buildRails(debouncedSearch ? filterApplied : baseItems), [debouncedSearch, filterApplied, baseItems]);

  const hasSearchOrFilter = !!debouncedSearch || filters.category !== 'all' || filters.risk !== 'all' || filters.revenueStructure !== 'all' || filters.type !== 'all' || filters.closingSoon;

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
              placeholder="작품명, 크리에이터, 태그 검색"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--toss-blue)]"
              style={{ backgroundColor: 'var(--toss-bg)', borderColor: 'var(--toss-border)', color: 'var(--toss-text)' }}
            />
          </div>
        </div>
      </header>

      <MarketFilterBar filters={filters} onChange={setFilters} />

      <main className="max-w-lg mx-auto px-4 pt-4 pb-8">
        {hasSearchOrFilter ? (
          <div className="space-y-4">
            <h2 className="text-[15px] font-bold" style={{ color: 'var(--toss-text)' }}>
              검색·필터 결과 ({filterApplied.length}건)
            </h2>
            <div className="space-y-3">
              {filterApplied.map((item, i) => (
                <MarketCard key={`${item.id}-${i}`} item={item} index={i} variant="horizon" />
              ))}
            </div>
            {filterApplied.length === 0 && (
              <p className="text-center py-12" style={{ color: 'var(--toss-text-secondary)' }}>조건에 맞는 수익권이 없습니다.</p>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {RAIL_KEYS.map((key) => {
              const railItems = key === 'recommend' ? personalizedRecommend.slice(0, 8) : rails[key];
              if (!railItems || railItems.length === 0) return null;
              return (
                <section key={key}>
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-[17px] font-bold tracking-tight" style={{ color: 'var(--toss-text)' }}>{RAIL_TITLES[key]}</h2>
                    <Link href={`/market?rail=${key}`} className="text-[13px] font-semibold" style={{ color: 'var(--toss-blue)' }}>전체보기</Link>
                  </div>
                  <div className="flex overflow-x-auto no-scrollbar pb-2 -mx-1" style={{ gap: RAIL_GAP }}>
                    {railItems.map((item, i) => (
                      <MarketCard key={`${item.id}-${key}-${i}`} item={item} index={i} variant="vertical" />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

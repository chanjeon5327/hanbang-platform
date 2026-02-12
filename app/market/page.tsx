'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getYtThumb } from '@/lib/thumbnails';
import SectionHeader from '@/components/home/SectionHeader';

type Item = {
  id: string;
  title: string;
  creator_name?: string;
  category?: string;
  thumbnail_url?: string;
  price?: number;
  change?: number;
};

const TOSS = {
  bg: '#f2f4f6',
  card: '#ffffff',
  blue: '#3182f6',
  text: '#191f28',
  secondary: '#6b7684',
  border: '#e5e8eb',
  positive: '#00c48c',
  negative: '#eb4d3d',
} as const;

const FALLBACK_ITEMS: Item[] = [
  { id: 'sample-1', title: '여행가 제이', creator_name: '유튜브', category: '여행', thumbnail_url: getYtThumb(0), price: 12300, change: 3.2 },
  { id: 'sample-2', title: '먹방 로드', creator_name: '유튜브', category: '먹방', thumbnail_url: getYtThumb(1), price: 9800, change: -1.1 },
  { id: 'sample-3', title: '일상 브이로그', creator_name: '유튜브', category: '일상', thumbnail_url: getYtThumb(2), price: 15500, change: 5.4 },
  { id: 'sample-4', title: '웹툰 작가 A', creator_name: '웹툰', category: '웹툰', thumbnail_url: getYtThumb(3), price: 22000, change: 2.8 },
  { id: 'sample-5', title: '웹소설 작가 B', creator_name: '웹소설', category: '웹소설', thumbnail_url: getYtThumb(4), price: 11800, change: 0.5 },
  { id: 'sample-6', title: '뮤직 비디오 프로젝트', creator_name: '음악', category: '음악', thumbnail_url: getYtThumb(5), price: 18500, change: -2.3 },
  { id: 'sample-7', title: '드라마 리메이크', creator_name: 'OTT', category: '드라마', thumbnail_url: getYtThumb(6), price: 26500, change: 8.1 },
  { id: 'sample-8', title: '팟캐스트 시즌2', creator_name: '오디오', category: '팟캐스트', thumbnail_url: getYtThumb(7), price: 8900, change: 1.2 },
  { id: 'curation-1', title: '드라마 리메이크', creator_name: 'OTT', category: '드라마', thumbnail_url: getYtThumb(8), price: 26500, change: 8.1 },
  { id: 'curation-2', title: '팟캐스트 시즌2', creator_name: '오디오', category: '팟캐스트', thumbnail_url: getYtThumb(9), price: 8900, change: 1.2 },
];

function MarketCard({ item, index }: { item: Item; index: number }) {
  const thumbSrc = item.thumbnail_url || getYtThumb(index);
  const change = item.change ?? 0;
  const price = item.price ?? 0;

  return (
    <Link
      href={`/market/${item.id}`}
      className="flex gap-4 p-4 rounded-2xl border border-black/5 active:scale-[0.99] transition-all"
      style={{ backgroundColor: TOSS.card, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
      aria-label={`${item.title} 수익권 보기`}
    >
      <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
        <img src={thumbSrc} alt="" className="w-full h-full object-cover" loading="lazy" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[15px] font-bold line-clamp-1" style={{ color: TOSS.text }}>{item.title}</h3>
          {index < 3 && (
            <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ backgroundColor: TOSS.negative }}>HOT</span>
          )}
        </div>
        <p className="text-[12px] mt-0.5 truncate" style={{ color: TOSS.secondary }}>
          {item.creator_name ?? item.category ?? '-'}
        </p>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-[14px] font-bold tabular-nums" style={{ color: TOSS.text }}>
            ₩{price.toLocaleString()}
          </span>
          <span className="text-[12px] font-semibold tabular-nums" style={{ color: change >= 0 ? TOSS.positive : TOSS.negative }}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function MarketPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/home/rails', { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        if (json?.rails?.length > 0) {
          const all: Item[] = [];
          json.rails.forEach((r: { items?: Item[] }) => {
            (r.items ?? []).forEach((it) => {
              all.push({
                id: it.id,
                title: it.title,
                creator_name: it.creator_name,
                category: it.category,
                thumbnail_url: it.thumbnail_url,
              });
            });
          });
          if (all.length > 0) setItems(all);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const displayItems = loading || items.length === 0 ? FALLBACK_ITEMS : items;

  return (
    <div className="min-h-screen pb-8" style={{ backgroundColor: 'var(--toss-bg)' }}>
      <header className="sticky top-0 z-50 bg-[var(--toss-card)] border-b border-black/5">
        <div className="flex items-center h-14 px-4 max-w-lg mx-auto">
          <Link href="/" className="p-2 -ml-2 rounded-xl" style={{ color: 'var(--toss-text-secondary)' }} aria-label="뒤로">
            <ArrowLeft size={24} strokeWidth={2} />
          </Link>
          <h1 className="flex-1 text-center text-[17px] font-bold" style={{ color: 'var(--toss-text)' }}>수익권 마켓</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-6">
        <SectionHeader title="전체 수익권" />
        <div className="space-y-3">
          {displayItems.map((item, i) => (
            <MarketCard key={`${item.id}-${i}`} item={item} index={i} />
          ))}
        </div>
      </main>
    </div>
  );
}

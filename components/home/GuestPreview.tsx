'use client';

import Link from 'next/link';
import { getYtThumb, PRODUCT_PLACEHOLDER } from '@/lib/thumbnails';
import { usePopularPicks, type RailItem } from '@/hooks/usePopularPicks';

const TOSS = { card: '#ffffff', blue: '#3182f6', text: '#191f28', secondary: '#6b7684' } as const;

function PreviewCard({ item, index }: { item: RailItem; index: number }) {
  const thumbSrc = item.thumbnail_url || getYtThumb(index);
  return (
    <Link
      href={`/market/${item.id}`}
      className="flex-shrink-0 block w-[140px] rounded-2xl overflow-hidden border border-black/5 focus:outline-none focus:ring-2 focus:ring-[var(--toss-blue)] focus:ring-offset-2"
      style={{ backgroundColor: TOSS.card, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
      aria-label={`${item.title} 수익권 보기`}
    >
      <div className="aspect-[4/5] relative overflow-hidden">
        <img
        src={thumbSrc}
        alt=""
        className="h-full w-full object-cover"
        loading="lazy"
        onError={(e) => {
          const el = e.currentTarget;
          if (!el.src.includes('placeholders/')) el.src = PRODUCT_PLACEHOLDER;
        }}
      />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" aria-hidden />
        <div className="absolute bottom-2 left-2 right-2">
          <span className="inline-block rounded-lg px-2 py-0.5 caption font-semibold text-white" style={{ backgroundColor: TOSS.blue }}>수익권</span>
        </div>
      </div>
      <div className="p-3">
        <div className="body-sm font-bold line-clamp-1" style={{ color: TOSS.text }}>{item.title}</div>
        {item.creator_name && <div className="caption mt-0.5 truncate" style={{ color: TOSS.secondary }}>{item.creator_name}</div>}
      </div>
    </Link>
  );
}

/** 비로그인: 인기 1~2개 프리뷰 - usePopularPicks (모두의 추천) 경계 */
export default function GuestPreview({ enabled = true }: { enabled?: boolean }) {
  const { items: allItems, loading } = usePopularPicks(enabled);
  const items = allItems.slice(0, 2);

  if (loading || items.length === 0) return null;

  return (
    <section className="mb-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="body font-bold" style={{ color: TOSS.text }}>인기 수익권</h3>
        <Link href="/market" className="body-sm font-medium" style={{ color: TOSS.blue }}>전체보기</Link>
      </div>
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-1">
        {items.map((item, i) => (
          <PreviewCard key={item.id} item={item} index={i} />
        ))}
      </div>
    </section>
  );
}

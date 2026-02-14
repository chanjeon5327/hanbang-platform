'use client';

import Link from 'next/link';
import { getYtThumb } from '@/lib/thumbnails';
import SectionHeader from '@/components/home/SectionHeader';
import { useRecommendedRails, type Rail, type RailItem } from '@/hooks/useRecommendedRails';

const TOSS = {
  card: '#ffffff',
  blue: '#3182f6',
  text: '#191f28',
  secondary: '#6b7684',
  negative: '#eb4d3d',
} as const;

const RAIL_CARD_W = 140;
const RAIL_GAP = 16;

function RailCard({ item, index, badge }: { item: RailItem; index: number; badge?: string }) {
  const thumbSrc = item.thumbnail_url || getYtThumb(index);
  return (
    <Link
      href={`/market/${item.id}`}
      className="flex-shrink-0 group block focus:outline-none focus:ring-2 focus:ring-[var(--toss-blue)] focus:ring-offset-2 rounded-2xl"
      style={{ width: RAIL_CARD_W }}
      aria-label={`${item.title} 수익권 보기`}
    >
      <div className="relative overflow-hidden rounded-2xl border border-black/5 active:scale-[0.97] transition-all duration-200" style={{ backgroundColor: 'var(--toss-card)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div className="aspect-[4/5] relative overflow-hidden">
          <img src={thumbSrc} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" aria-hidden />
          {badge && (
            <span className="absolute top-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ backgroundColor: TOSS.negative }}>
              {badge}
            </span>
          )}
          <div className="absolute bottom-2 left-2 right-2">
            <span className="inline-block rounded-lg px-2 py-0.5 text-[10px] font-semibold text-white" style={{ backgroundColor: TOSS.blue }}>수익권</span>
          </div>
        </div>
        <div className="p-3">
          <div className="text-[13px] font-bold line-clamp-1 leading-snug" style={{ color: 'var(--toss-text)' }}>{item.title}</div>
          {item.creator_name && <div className="text-[11px] mt-0.5 font-medium truncate" style={{ color: 'var(--toss-text-secondary)' }}>{item.creator_name}</div>}
        </div>
      </div>
    </Link>
  );
}

function RailSection({ rail, railIndex }: { rail: Rail; railIndex: number }) {
  const badge = rail.key?.includes('hot') || rail.title === '마감임박' ? '마감임박' : undefined;
  const isEmpty = !rail.items || rail.items.length === 0;

  if (isEmpty) return null;

  return (
    <section className="mb-6" aria-label={rail.title} data-testid={`rail-${rail.key}`}>
      <SectionHeader title={rail.title} viewAllHref="/market" />
      <div className="flex overflow-x-auto no-scrollbar pb-2 -mx-1" style={{ gap: RAIL_GAP }}>
        {rail.items.map((item, i) => (
          <RailCard key={`${item.id}-${i}`} item={item} index={railIndex * 20 + i} badge={badge} />
        ))}
      </div>
    </section>
  );
}

/** 오늘의 추천 / 마감임박 최소 2개 - useRecommendedRails 훅 경계 */
export default function RecommendedRails({ enabled = true, isLoggedIn = false }: { enabled?: boolean; isLoggedIn?: boolean }) {
  const { rails, loading } = useRecommendedRails(enabled);

  if (loading) {
    return (
      <section className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <div className="h-5 w-32 rounded bg-black/5 animate-pulse" />
          <div className="h-4 w-16 rounded bg-black/5 animate-pulse" />
        </div>
        <div className="flex gap-4 overflow-hidden pb-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-shrink-0 w-[140px] rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--toss-card)' }}>
              <div className="aspect-[4/5] bg-black/5 animate-pulse" />
              <div className="p-3 space-y-2">
                <div className="h-3 w-full rounded bg-black/5 animate-pulse" />
                <div className="h-2.5 w-2/3 rounded bg-black/5 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <>
      {isLoggedIn && (
        <p className="text-[13px] font-medium mb-3" style={{ color: TOSS.secondary }}>
          회원님의 취향 기반 추천
        </p>
      )}
      {rails.map((rail, ri) => (
        <RailSection key={rail.key} rail={rail} railIndex={ri} />
      ))}
    </>
  );
}

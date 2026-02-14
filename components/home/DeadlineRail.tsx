'use client';

import Link from 'next/link';
import { getYtThumb } from '@/lib/thumbnails';
import SectionHeader from '@/components/home/SectionHeader';
import { useDeadlinePicks, type RailItem } from '@/hooks/useDeadlinePicks';

const TOSS = {
  card: '#ffffff',
  blue: '#3182f6',
  text: '#191f28',
  secondary: '#6b7684',
  negative: '#eb4d3d',
} as const;

const RAIL_CARD_W = 140;
const RAIL_GAP = 16;

function RailCard({ item, index }: { item: RailItem; index: number }) {
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
          <span className="absolute top-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ backgroundColor: TOSS.negative }}>
            마감임박
          </span>
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

/** 마감임박 - deadline 임박 순, 같은 날 마감은 서버에서 랜덤 */
export default function DeadlineRail({ enabled = true }: { enabled?: boolean }) {
  const { items, loading } = useDeadlinePicks(enabled);

  if (!enabled) return null;

  return (
    <section className="mb-6" aria-label="마감임박" data-testid="deadline-rail">
      <SectionHeader title="마감임박" viewAllHref="/market?tab=deadline" />
      {loading ? (
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="w-[140px] shrink-0 aspect-[4/5] rounded-2xl bg-black/5 animate-pulse" />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="flex overflow-x-auto no-scrollbar pb-2 -mx-1" style={{ gap: RAIL_GAP }}>
          {items.map((item, i) => (
            <RailCard key={`${item.id}-${i}`} item={item} index={i} />
          ))}
        </div>
      ) : (
        <p className="text-[13px] py-6 text-center" style={{ color: 'var(--toss-text-secondary)' }}>마감 예정인 작품이 없습니다.</p>
      )}
    </section>
  );
}

'use client';

import Link from 'next/link';
import { getYtThumb, PRODUCT_PLACEHOLDER } from '@/lib/thumbnails';
import SectionHeader from '@/components/home/SectionHeader';
import { useDeadlinePicks, type RailItem } from '@/hooks/useDeadlinePicks';

const RAIL_CARD_W = 140;
const RAIL_GAP = 16;

const SECTION_PX = 'px-4';
const SECTION_PY = 'py-6';
const CONTAINER = 'mx-auto max-w-[1320px]';

function RailCard({ item, index }: { item: RailItem; index: number }) {
  const thumbSrc = item.thumbnail_url || getYtThumb(index);
  return (
    <Link
      href={`/market/${item.id}`}
      className="flex-shrink-0 group block focus:outline-none focus:ring-2 focus:ring-[var(--royal-blue)] focus:ring-offset-2 rounded-2xl"
      style={{ width: RAIL_CARD_W }}
      aria-label={`${item.title} 수익권 보기`}
    >
      <div className="relative overflow-hidden rounded-2xl border active:opacity-95 transition-all duration-200 hb-card-hover" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-sm)' }}>
        <div className="aspect-[4/5] relative overflow-hidden">
          <img
            src={thumbSrc}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:opacity-95"
            loading="lazy"
            onError={(e) => {
              const el = e.currentTarget;
              if (!el.src.includes('placeholders/')) el.src = PRODUCT_PLACEHOLDER;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" aria-hidden />
          <span className="absolute top-2 right-2 rounded-full px-2 py-0.5 caption font-bold text-white pointer-events-none" style={{ backgroundColor: 'var(--accent-loss)' }}>
            마감임박
          </span>
          <div className="absolute bottom-2 left-2 right-2 pointer-events-none">
            <span className="inline-block rounded-lg px-2 py-0.5 caption font-semibold text-white" style={{ backgroundColor: 'var(--royal-blue)' }}>수익권</span>
          </div>
        </div>
        <div className="p-3">
          <div className="body-sm font-bold line-clamp-1 leading-snug" style={{ color: 'var(--text)' }}>{item.title}</div>
          {item.creator_name && <div className="caption mt-0.5 font-medium truncate" style={{ color: 'var(--text-secondary)' }}>{item.creator_name}</div>}
        </div>
      </div>
    </Link>
  );
}

/** 마감임박 - deadline 임박 순, 같은 날 마감은 서버에서 랜덤 */
export default function DeadlineRail({ enabled = true }: { enabled?: boolean }) {
  const { items, loading } = useDeadlinePicks(enabled);

  if (!enabled) return null;
  if (!loading && items.length === 0) return null;

  return (
    <section className={`${SECTION_PX} ${SECTION_PY}`} aria-label="마감임박" data-testid="deadline-rail">
      <div className={CONTAINER}>
        <SectionHeader title="마감임박" viewAllHref="/market?tab=deadline" />
        {loading ? (
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="w-[140px] shrink-0 aspect-[4/5] rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--border)' }} />
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="flex overflow-x-auto no-scrollbar pb-2" style={{ gap: RAIL_GAP }}>
            {items.map((item, i) => (
              <RailCard key={`${item.id}-${i}`} item={item} index={i} />
            ))}
          </div>
        ) : (
          <p className="body-sm py-6 text-center" style={{ color: 'var(--text-secondary)' }}>마감 예정인 작품이 없습니다.</p>
        )}
      </div>
    </section>
  );
}

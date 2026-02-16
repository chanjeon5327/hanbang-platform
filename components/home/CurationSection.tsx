'use client';

import Link from 'next/link';
import InterestCard from './InterestCard';
import SectionHeader from './SectionHeader';
import { usePopularPicks } from '@/hooks/usePopularPicks';

/** 모두의 추천 - 누적 추천(관심) 수 기반 정렬, 동률이면 랜덤으로 큐레이팅됨 */
export default function CurationSection({ title = '모두의 추천', enabled = true }: { title?: string; enabled?: boolean }) {
  const { items, loading } = usePopularPicks(enabled);

  if (!enabled) return null;
  if (loading) {
    return (
      <section className="mt-2" aria-label={title} data-testid="curation-section">
        <SectionHeader title={title} viewAllHref="/market?tab=popular" />
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="w-[150px] shrink-0 rounded-[16px] h-[140px] bg-black/5 animate-pulse" />
          ))}
        </div>
      </section>
    );
  }
  return (
    <section className="mt-2" aria-label={title} data-testid="curation-section">
      <SectionHeader title={title} viewAllHref="/market?tab=popular" />
      {items.length > 0 ? (
        <>
          <p className="caption mb-2" style={{ color: 'var(--toss-text-secondary)' }}>누적 추천(관심) 수 기반 정렬 · 동률이면 랜덤으로 큐레이팅됨</p>
          <div className="flex gap-3 overflow-x-auto no-scrollbar">
            {items.map((item, i) => (
              <InterestCard key={item.id} id={item.id} index={i} title={item.title} thumbUrl={item.thumbnail_url} />
            ))}
          </div>
        </>
      ) : (
        <p className="body-sm py-6 text-center" style={{ color: 'var(--toss-text-secondary)' }}>아직 추천 작품이 없습니다.</p>
      )}
    </section>
  );
}

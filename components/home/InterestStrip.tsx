'use client';

import { useMyInterests } from '@/hooks/useMyInterests';
import { usePopularPicks } from '@/hooks/usePopularPicks';
import SectionHeader from './SectionHeader';
import InterestCard from './InterestCard';

/** 나의 관심 - 관심 0개일 때 인기 2개 자동 표시 */
export default function InterestStrip({ enabled = true }: { enabled?: boolean }) {
  const { items, loading } = useMyInterests(enabled);
  const { items: popular } = usePopularPicks(!loading && items.length === 0);

  const displayItems = items.length > 0 ? items : popular.slice(0, 3);

  if (!enabled) return null;

  return (
    <section className="mt-2" aria-label="나의 관심" data-testid="interest-strip">
      <SectionHeader title="나의 관심" viewAllHref="/market?tab=my" />

      {loading && (
        <div className="text-sm px-4 py-6" style={{ color: 'var(--toss-text-secondary)' }}>
          불러오는 중...
        </div>
      )}

      {!loading && items.length === 0 && displayItems.length === 0 && (
        <div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--toss-text-secondary)' }}>
          아직 관심 작품이 없습니다.<br />
          마음에 드는 작품에 ❤️ 관심을 눌러보세요.
        </div>
      )}

      {!loading && displayItems.length > 0 && (
        <>
          {items.length === 0 && (
            <p className="text-sm text-gray-400 px-4 mb-2">
              관심 작품이 없어 인기 작품을 보여드립니다.
            </p>
          )}
          <div className="flex gap-3 overflow-x-auto no-scrollbar">
            {displayItems.map((item, i) => (
              <InterestCard
                key={item.id}
                id={item.id}
                index={i}
                title={item.title}
                thumbUrl={item.thumbnail_url}
                isInterested={items.some((m) => m.id === item.id)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

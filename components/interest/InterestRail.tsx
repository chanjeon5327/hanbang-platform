'use client';

import InterestCard, { InterestCardData } from './InterestCard';

type Props = {
  title: string;
  items: InterestCardData[];
  mode?: 'default' | 'onboarding';
  onRate?: (id: string, score: number) => void;
};

export default function InterestRail({
  title,
  items,
  mode = 'default',
  onRate,
}: Props) {
  return (
    <section className="py-2">
      <div className="px-4 mb-2">
        <h2 className="body-lg font-bold">{title}</h2>
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4">
        {items.map((it) => (
          <InterestCard
            key={it.id}
            data={it}
            mode={mode}
            onRate={onRate}
          />
        ))}
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}

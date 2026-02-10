'use client';

import { useInterestPreview } from '@/stores/interestPreview';
import SharedThumb from '@/components/interest/SharedThumb';
import { logEvent } from '@/utils/logEvent';

type Item = {
  id: string;
  title: string;
  subtitle?: string;
  thumbUrl: string;
  score?: number;
};

export default function HomeHero({
  item,
  variant,
}: {
  item: Item;
  variant: 'A' | 'B';
}) {
  const { open } = useInterestPreview();

  const handleClick = () => {
    logEvent('hero_clicked', {
      variant,
      item_id: item.id,
      score: item.score ?? null,
    });
    open(item.id, item);
  };

  return (
    <section className="px-4 pt-3">
      <button
        onClick={handleClick}
        className="
          relative w-full
          h-[300px] sm:h-[340px]
          overflow-hidden rounded-[26px]
          bg-[var(--card-bg)]
          ring-1 ring-[var(--card-border)]
          active:scale-[0.99]
        "
      >
        <SharedThumb
          src={item.thumbUrl}
          anchorId={`thumb-${item.id}`}
          className="absolute inset-0 h-full w-full"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/5" />

        <div className="absolute inset-x-0 bottom-0 p-4 text-left">
          <div className="text-[20px] font-extrabold text-white leading-tight">
            {item.title}
          </div>

          {item.subtitle && (
            <div className="mt-1 text-[13px] text-white/75">
              {item.subtitle}
            </div>
          )}

          <div className="mt-3 flex items-center gap-2">
            <span className="inline-block rounded-full bg-white/15 px-4 py-2 text-[12px] font-semibold text-white">
              {variant === 'A' ? '지금 살펴보기' : '수익 구조 보기'}
            </span>

            {typeof item.score === 'number' && item.score > 0 && (
              <span className="text-[12px] text-white/70">
                취향 적합도 ★{item.score}
              </span>
            )}
          </div>
        </div>
      </button>
    </section>
  );
}

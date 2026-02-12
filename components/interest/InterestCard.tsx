'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { getYtThumb } from '@/lib/thumbnails';

export type InterestCardData = {
  id: string;
  title: string;
  subtitle?: string;
  thumbUrl?: string;
};

type Props = {
  data: InterestCardData;
  mode?: 'default' | 'onboarding';
  onRate?: (id: string, score: number) => void;
};

export default function InterestCard({
  data,
  mode = 'default',
  onRate,
}: Props) {
  const [sending, setSending] = useState(false);

  const rate = async (score: number) => {
    if (sending) return;
    setSending(true);

    await fetch('/api/interest/rate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        item_id: data.id,
        score,
      }),
    });

    setSending(false);
    onRate?.(data.id, score);
  };

  const thumbSrc = data.thumbUrl || getYtThumb(parseInt(data.id, 10) || 0);

  return (
    <div className="w-[160px] shrink-0">
      <div className="aspect-[4/5] rounded-xl overflow-hidden bg-black/20">
        <img src={thumbSrc} alt="" className="w-full h-full object-cover" loading="lazy" />
      </div>
      <div className="mt-1 text-sm font-semibold truncate">{data.title}</div>
      {mode === 'onboarding' && (
        <div className="mt-2 flex justify-between">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => rate(n)}
              className="text-yellow-400 disabled:opacity-40"
              disabled={sending}
            >
              <Star size={16} fill="currentColor" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { InterestCardData } from './InterestCard';
import { Star } from 'lucide-react';

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

  return (
    <div className="w-[160px] shrink-0">
      {/* 썸네일 등 기존 UI 유지 */}

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

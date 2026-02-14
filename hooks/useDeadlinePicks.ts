'use client';

import { useEffect, useState } from 'react';
import { getYtThumb } from '@/lib/thumbnails';

export type RailItem = {
  id: string;
  title: string;
  thumbnail_url?: string;
  creator_name?: string;
  category?: string;
  platform?: string;
  deadline?: string;
};

/**
 * 마감임박 - deadline 임박 순, 같은 날 마감은 서버에서 랜덤
 * GET /api/home/deadline 경계
 */
export function useDeadlinePicks(enabled = true): { items: RailItem[]; loading: boolean } {
  const [items, setItems] = useState<RailItem[]>([]);
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) {
      setItems([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    fetch('/api/home/deadline')
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        const list = json?.items ?? [];
        setItems(list.map((r: Record<string, unknown>, idx: number) => ({
          id: r.id,
          title: r.title,
          thumbnail_url: r.thumbnail_url ?? getYtThumb(idx),
          creator_name: r.creator_name,
          category: r.category,
          platform: r.platform,
          deadline: r.deadline,
        })));
      })
      .catch(() => { if (!cancelled) setItems([]); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [enabled]);

  return { items, loading };
}

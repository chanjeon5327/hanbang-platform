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
 * 筌띾뜃而�?袁⑥뺏 - deadline ?袁⑥뺏 ?? 揶쏆늿? ??筌띾뜃而�?占� ?�뮆苡�?癒�苑� ?�뮆�쑁
 * GET /api/home/deadline 野껋럡���
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

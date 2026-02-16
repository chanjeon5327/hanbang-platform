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
};

/**
 * 筌뤴뫀紐�??�빊遺우퓝 - ?袁⑷퍥 ?醫�? �꽴占�???袁⑹읅 ??疫꿸퀣? ?類ｌ졊, ?�늾履� ?�뮆�쑁
 * GET /api/home/popular 野껋럡���
 */
export function usePopularPicks(enabled = true): { items: RailItem[]; loading: boolean } {
  const [items, setItems] = useState<RailItem[]>([]);
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) {
      setItems([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    fetch('/api/home/popular')
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        const list = json?.items ?? [];
        setItems(list.map((r: Record<string, unknown>, idx: number) => ({
          id: r.id,
          title: r.title,
          thumbnail_url: (r.thumbnail_url as string) ?? getYtThumb(idx),
          creator_name: r.creator_name,
          category: r.category,
          platform: r.platform,
        })));
      })
      .catch(() => { if (!cancelled) setItems([]); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [enabled]);

  return { items, loading };
}

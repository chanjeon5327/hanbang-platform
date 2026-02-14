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

const FALLBACK: RailItem[] = [];

/**
 * 나의 관심 - 로그인 유저가 직접 관심 표시한 작품
 * GET /api/home/my-interests 경계
 */
export function useMyInterests(enabled: boolean): { items: RailItem[]; loading: boolean } {
  const [items, setItems] = useState<RailItem[]>([]);
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) {
      setItems([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    fetch('/api/home/my-interests', { cache: 'no-store' })
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
        })));
      })
      .catch(() => { if (!cancelled) setItems([]); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [enabled]);

  return { items, loading };
}

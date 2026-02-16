'use client';

import { useEffect, useState } from 'react';
import { getYtThumb } from '@/lib/thumbnails';

export type MomentumItem = {
  id: string;
  title: string;
  thumbnail_url?: string;
  creator_name?: string;
  category?: string;
  platform?: string;
  total_raise?: number;
  current_raise?: number;
  participants?: number;
  event_date?: string | null;
  youtube_id?: string | null;
  integrity_ok?: boolean;
  settlement_count?: number;
  product_type?: 'DIVIDEND_ONLY' | 'DIVIDEND_TRADABLE';
};

export function useMomentumPicks(enabled = true): { items: MomentumItem[]; loading: boolean } {
  const [items, setItems] = useState<MomentumItem[]>([]);
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) {
      setItems([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    fetch('/api/market/popular?limit=6&offset=0')
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        const list = json?.items ?? [];
        setItems(list.map((r: Record<string, unknown>, idx: number) => ({
          id: String(r.id ?? ''),
          title: String(r.title ?? ''),
          thumbnail_url: (r.thumbnail_url as string) ?? getYtThumb(idx),
          creator_name: r.creator_name as string | undefined,
          category: r.category as string | undefined,
          platform: r.platform as string | undefined,
          total_raise: Number(r.total_raise ?? 0),
          current_raise: Number(r.current_raise ?? 0),
          participants: Number(r.participants ?? 0),
          event_date: r.event_date ?? null,
          youtube_id: (r.youtube_id as string) ?? null,
          integrity_ok: r.integrity_ok ?? false,
          settlement_count: Number(r.settlement_count ?? 0),
          product_type: (r.product_type as 'DIVIDEND_ONLY' | 'DIVIDEND_TRADABLE') ?? 'DIVIDEND_ONLY',
        })));
      })
      .catch(() => { if (!cancelled) setItems([]); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [enabled]);

  return { items, loading };
}

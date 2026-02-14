'use client';

import { useEffect, useState, useCallback } from 'react';

export type MarketItem = {
  id: string;
  title: string;
  summary?: string;
  creator_name?: string;
  category?: string;
  platform?: string;
  thumbnail_url?: string;
  deadline?: string | null;
  youtube_video_id?: string | null;
  media_url?: string | null;
  created_at?: string;
  total_raise?: number | null;
  current_raise?: number | null;
  popular_cnt?: number;
  yield_rate?: number | null;
  participants?: number;
  artist_keyword?: string | null;
};

export function useMarketItem(id: string | undefined) {
  const [item, setItem] = useState<MarketItem | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/market/item/${id}`, { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(setItem)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) {
      setItem(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`/api/market/item/${id}`, { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(setItem)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { item, loading, error, refetch };
}

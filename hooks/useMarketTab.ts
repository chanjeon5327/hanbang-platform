'use client';

import { useEffect, useState, useCallback } from 'react';

export type RailItem = {
  id: string;
  title: string;
  creator_name?: string;
  category?: string;
  platform?: string;
  thumbnail_url?: string;
  deadline?: string | null;
};

const TAB_APIS: Record<string, string> = {
  all: '/api/market/all',
  popular: '/api/market/popular',
  deadline: '/api/market/deadline',
  my: '/api/market/my-interests',
};

export function useMarketTab(
  tab: string,
  category: string | null,
  isLoggedIn: boolean
) {
  const [items, setItems] = useState<RailItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState<number | null>(null);

  const fetchPage = useCallback(async (offset = 0, append = false) => {
    if (tab === 'my' && !isLoggedIn) {
      setItems([]);
      setLoading(false);
      return;
    }

    const api = tab === 'category' ? '/api/market/all' : TAB_APIS[tab] ?? TAB_APIS.all;
    const params = new URLSearchParams({ limit: '24', offset: String(offset) });
    if (tab === 'category' && category) params.set('category', category);

    setLoading(true);
    try {
      const res = await fetch(`${api}?${params}`, { cache: 'no-store' });
      const json = await res.json();
      const list = json?.items ?? [];
      setItems(append ? (prev) => [...prev, ...list] : list);
      setNextCursor(json?.next_cursor ?? null);
    } catch {
      setItems(append ? (prev) => prev : []);
      setNextCursor(null);
    } finally {
      setLoading(false);
    }
  }, [tab, category, isLoggedIn]);

  useEffect(() => {
    fetchPage(0, false);
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (nextCursor != null && !loading) fetchPage(nextCursor, true);
  }, [nextCursor, loading, fetchPage]);

  return { items, loading, nextCursor, loadMore, refetch: () => fetchPage(0, false) };
}

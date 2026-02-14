'use client';

import { useEffect, useState, useCallback } from 'react';

export type InvestLogItem = {
  nickname: string;
  amount: number;
  created_at: string;
};

export function useRecentInvestLog(productId: string | undefined) {
  const [items, setItems] = useState<InvestLogItem[]>([]);

  const refetch = useCallback(() => {
    if (!productId) return;
    fetch(`/api/market/recent-invest/${productId}`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setItems(data?.items ?? []))
      .catch(() => setItems([]));
  }, [productId]);

  useEffect(() => {
    if (!productId) {
      setItems([]);
      return;
    }
    refetch();
  }, [productId, refetch]);

  return { items, refetch };
}

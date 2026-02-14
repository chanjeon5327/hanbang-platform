'use client';

import { useEffect, useState, useCallback } from 'react';

export type InvestSummary = {
  totalInvest: number;
  avgReturnRate: number;
  monthlyProfit: number;
  holdingsValue: number;
};

export function useInvestSummary(isLoggedIn: boolean) {
  const [data, setData] = useState<InvestSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(() => {
    if (!isLoggedIn) return;
    setLoading(true);
    fetch('/api/wallet/invest-summary', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch('/api/wallet/invest-summary', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  return { data, loading, refetch };
}

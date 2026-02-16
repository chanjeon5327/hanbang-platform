'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/context/StoreContext';

type LedgerEntry = {
  id: string;
  entry_type: string;
  amount: number;
  quantity: number;
  asset_id: string | null;
};

export type AssetFromLedger = {
  totalAssets: number;
  userCash: number;
  holdingsValue: number;
  returnAmount: number;
  returnRate: number;
  dailyChange?: number;
};

/**
 * wallet/ledger 疫꿸퀡而� ?癒�沅� ��④쑴沅�
 * - balance: ledger CASH_CREDIT - CASH_DEBIT
 * - holdings: StoreContext (ledger ASSET_CREDIT?占� ?�늽由�?遺얜쭆 癰귣똻��� ?�꼷�뵡亦�?
 */
export function useAssetFromLedger(isLoggedIn: boolean): {
  data: AssetFromLedger | null;
  loading: boolean;
} {
  const { holdings, getTotalReturn } = useStore();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    fetch('/api/wallet/ledger', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : { entries: [] }))
      .then((data) => {
        if (cancelled) return;
        const entries: LedgerEntry[] = data.entries ?? [];
        let total = 0;
        entries.forEach((r) => {
          if (r.entry_type === 'CASH_DEBIT') total -= Math.abs(Number(r.amount));
          if (r.entry_type === 'CASH_CREDIT') total += Number(r.amount);
        });
        setBalance(total);
      })
      .catch(() => {
        if (!cancelled) setBalance(0);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return { data: null, loading: false };
  }

  const holdingsValue = holdings.reduce((s, h) => s + h.currentValue, 0);
  const { amount: returnAmount, rate: returnRate } = getTotalReturn();
  const totalAssets = balance + holdingsValue;

  return {
    data: {
      totalAssets,
      userCash: balance,
      holdingsValue,
      returnAmount,
      returnRate,
      dailyChange: 0,
    },
    loading,
  };
}

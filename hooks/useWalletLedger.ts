'use client';

import { useEffect, useState, useCallback } from 'react';

export type LedgerEntry = {
  id: string;
  order_id: string | null;
  entry_type: string;
  currency: string;
  amount: number;
  asset_id: string | null;
  quantity: number;
  memo: string | null;
  created_at: string;
};

export type WalletSummary = {
  cashBalance: number;
  investedPrincipal: number;
  assetQuantity: number;
  assetIds: string[];
  entries: LedgerEntry[];
  fetchedAt: string | null;
};

/**
 * ?�꼷�뵡�몴??類ㅼ벥 (椰꾧퀡�삋?�슦�굨 ��⑥쥙�젟)
 * - currentValue = remainingQty * currentPrice
 * - unrealizedPnl = currentValue - remainingCost
 * - unrealizedRate = (unrealizedPnl / remainingCost) * 100 (0 ?�꼶�땸 獄쎻뫗?)
 * - 癰귣똻��� ?��???remainingCost) 疫꿸퀣? 沃섎챷�뼄???�꼷�뵡�몴醫딆춸 ?�딆뒠. investedPrincipal 疫꿸퀡而� ?�뮄援�.
 *
 * ?�뜃援�??calcReturn: ?�뫁�뵬 ?癒�沅� ??癰귣똻���?? UI 筌롫뗄�뵥?占� /api/wallet/position, invest-summary???��???疫꿸퀡而� ?�딆뒠.
 */
export function calcReturn(
  summary: WalletSummary,
  currentPrice: number,
  assetQuantity?: number,
  holdingsValue?: number
): { amount: number; rate: number; principal: number; currentValue: number } {
  const principal = summary.investedPrincipal;
  const cashBalance = summary.cashBalance;
  const qty = assetQuantity ?? summary.assetQuantity;

  const assetValue =
    holdingsValue !== undefined && holdingsValue !== null
      ? holdingsValue
      : qty * currentPrice;

  const currentValue = cashBalance + assetValue;

  if (principal <= 0) {
    return {
      amount: 0,
      rate: 0,
      principal,
      currentValue: Math.round(currentValue),
    };
  }

  const amount = currentValue - principal;
  const rate = (amount / principal) * 100;

  return {
    amount: Math.round(amount),
    rate: Math.round(rate * 100) / 100,
    principal,
    currentValue: Math.round(currentValue),
  };
}

export function useWalletLedger() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 10000);
    fetch('/api/wallet/ledger', { cache: 'no-store', signal: ctrl.signal })
      .then((res) => {
        clearTimeout(t);
        if (!res.ok) throw new Error('조회 실패');
        return res.json();
      })
      .then((data) => {
        const list = data.entries ?? [];
        setEntries(list);
        setFetchedAt(new Date().toISOString());
      })
      .catch((e) => {
        clearTimeout(t);
        setError(e.name === 'AbortError' ? '시간 초과' : e.message);
        setEntries([]);
      })
      .finally(() => {
        clearTimeout(t);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    const onSuccess = () => refetch();
    window.addEventListener('invest-success', onSuccess);
    window.addEventListener('wallet-refresh', onSuccess);
    return () => {
      window.removeEventListener('invest-success', onSuccess);
      window.removeEventListener('wallet-refresh', onSuccess);
    };
  }, [refetch]);

  const summary: WalletSummary = {
    cashBalance: entries.reduce((sum, r) => {
      if (r.entry_type === 'CASH_DEBIT') return sum - Math.abs(Number(r.amount));
      if (r.entry_type === 'CASH_CREDIT') return sum + Number(r.amount);
      return sum;
    }, 0),
    investedPrincipal: entries
      .filter((r) => r.entry_type === 'CASH_DEBIT')
      .reduce((sum, r) => sum + Math.abs(Number(r.amount)), 0),
    assetQuantity: Math.max(
      0,
      entries
        .filter((r) => r.entry_type === 'ASSET_CREDIT')
        .reduce((sum, r) => sum + Number(r.quantity), 0) -
        entries
          .filter((r) => r.entry_type === 'ASSET_DEBIT')
          .reduce((sum, r) => sum + Number(r.quantity), 0)
    ),
    assetIds: [...new Set(entries.filter((r) => r.asset_id).map((r) => r.asset_id!))],
    entries,
    fetchedAt,
  };

  return { summary, loading, error, refetch };
}

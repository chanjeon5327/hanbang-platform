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
 * 수익률 계산 (ledger 기반)
 * - 투자원금(principal): CASH_DEBIT 절대값 합
 * - 현재평가액(currentValue): 현금잔고 + 보유자산평가
 * - 수익률 = (현재평가액 - 투자원금) / 투자원금 * 100 (분모 0 방지)
 *
 * @param summary - WalletSummary (cashBalance, investedPrincipal, assetQuantity)
 * @param currentPrice - 단일 자산 시 주당 현재가 (원)
 * @param assetQuantity - 보유 수량 (미지정 시 summary.assetQuantity)
 * @param holdingsValue - 보유자산 평가액 (원). 전달 시 currentPrice 무시
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
    fetch('/api/wallet/ledger', { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error('조회 실패');
        return res.json();
      })
      .then((data) => {
        const list = data.entries ?? [];
        setEntries(list);
        setFetchedAt(new Date().toISOString());
      })
      .catch((e) => {
        setError(e.message);
        setEntries([]);
      })
      .finally(() => setLoading(false));
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

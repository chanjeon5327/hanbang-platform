'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Download, ArrowLeftRight, Upload } from 'lucide-react';
import { useWalletLedger, type LedgerEntry } from '@/hooks/useWalletLedger';

const TOSS = { bg: '#f2f4f6', card: '#ffffff', blue: '#3182f6', text: '#191f28', secondary: '#6b7684', border: '#e5e8eb', positive: '#00c48c', negative: '#eb4d3d' };
const UPBIT = { panel: '#161616', border: '#2b2b2b', bid: '#1e88e5', ask: '#e53935', text: '#e0e0e0', dim: '#8e8e8e', positive: '#00c48c' };

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-200/50 ${className}`} />;
}

type InvestSummary = {
  totalInvest: number;
  cashBalance: number;
  totalValue: number;
  avgReturnRate: number;
  holdingsValue: number;
};

export default function Wallet() {
  const { summary, loading, error, refetch } = useWalletLedger();
  const [investSummary, setInvestSummary] = useState<InvestSummary | null>(null);

  const fetchInvestSummary = React.useCallback(() => {
    fetch('/api/wallet/invest-summary', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setInvestSummary(d))
      .catch(() => setInvestSummary(null));
  }, []);

  useEffect(() => {
    fetchInvestSummary();
  }, [fetchInvestSummary, loading]);

  useEffect(() => {
    const onRefresh = () => fetchInvestSummary();
    window.addEventListener('wallet-refresh', onRefresh);
    window.addEventListener('invest-success', onRefresh);
    return () => {
      window.removeEventListener('wallet-refresh', onRefresh);
      window.removeEventListener('invest-success', onRefresh);
    };
  }, [fetchInvestSummary]);

  const totalDisplay = investSummary?.totalValue ?? summary.cashBalance;
  const displayReturn =
    investSummary && investSummary.totalInvest > 0
      ? {
          amount: Math.round(investSummary.totalValue - investSummary.totalInvest),
          rate: investSummary.avgReturnRate,
        }
      : summary.investedPrincipal > 0
        ? (() => {
            const amount = summary.cashBalance - summary.investedPrincipal;
            const rate = (amount / summary.investedPrincipal) * 100;
            return { amount: Math.round(amount), rate: Math.round(rate * 100) / 100 };
          })()
        : null;

  return (
    <div className="min-h-screen pb-24 bg-[var(--toss-bg)]">
      <header className="sticky top-0 z-50 px-4 py-3 flex items-center bg-[var(--toss-bg)]">
        <Link href="/" className="text-[14px] font-medium text-[var(--toss-text-secondary)]">‹ 뒤로</Link>
        <h1 className="flex-1 text-center text-[17px] font-bold text-[var(--toss-text)]">내 자산</h1>
        <span className="w-10" />
      </header>

      <main className="px-4 pt-2 pb-8">
        {/* 1. 총 평가 자산 */}
        <div className="rounded-2xl p-6 mb-6" style={{ backgroundColor: 'var(--toss-card)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div className="text-[13px] font-medium mb-1" style={{ color: 'var(--toss-text-secondary)' }}>총 평가 자산</div>
          {loading ? (
            <Skeleton className="h-8 w-40 mb-2" />
          ) : error ? (
            <div className="flex items-center gap-2">
              <span className="text-[14px] text-[var(--toss-text-secondary)]">조회 실패</span>
              <button onClick={refetch} className="text-[13px] font-semibold text-[var(--toss-blue)]">다시 시도</button>
            </div>
          ) : (
            <>
              <div className="text-[28px] font-bold tracking-tight tabular-nums" style={{ color: 'var(--toss-text)' }}>
                ₩{totalDisplay.toLocaleString()}
              </div>
              {displayReturn && (
                <div className="text-[14px] font-semibold mt-1 tabular-nums" style={{ color: displayReturn.amount >= 0 ? TOSS.positive : TOSS.negative }}>
                  {displayReturn.amount >= 0 ? '+' : ''}{displayReturn.rate.toFixed(2)}%
                  <span className="text-[12px] ml-1 font-normal opacity-90">
                    ({displayReturn.amount >= 0 ? '+' : ''}{displayReturn.amount.toLocaleString()}원)
                  </span>
                </div>
              )}
              {summary.fetchedAt && (
                <p className="text-[11px] mt-1" style={{ color: 'var(--toss-text-secondary)' }}>
                  집계 기준 {new Date(summary.fetchedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
              <div className="mt-4 pt-4 flex gap-6 text-[13px]" style={{ borderTop: '1px solid var(--toss-border)' }}>
                <div>
                  <span style={{ color: 'var(--toss-text-secondary)' }}>예수금 </span>
                  <span className="font-semibold tabular-nums" style={{ color: 'var(--toss-text)' }}>{summary.cashBalance.toLocaleString()}원</span>
                </div>
                <div>
                  <span style={{ color: 'var(--toss-text-secondary)' }}>투자원금 </span>
                  <span className="font-semibold tabular-nums" style={{ color: 'var(--toss-text)' }}>{summary.investedPrincipal.toLocaleString()}원</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* 2. CTA */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <Link href="/wallet/deposit" className="rounded-2xl p-4 flex flex-col gap-1 transition active:scale-[0.98]" style={{ backgroundColor: 'var(--toss-blue)', color: 'var(--toss-card)', boxShadow: '0 4px 12px rgba(49,130,246,0.35)' }}>
            <Download size={26} strokeWidth={2} />
            <span className="text-[14px] font-bold">입금</span>
            <span className="text-[11px] opacity-90">KRW 충전</span>
          </Link>
          <Link href="/wallet/swap" className="rounded-2xl p-4 flex flex-col gap-1 transition active:scale-[0.98] border" style={{ backgroundColor: 'var(--toss-card)', borderColor: 'var(--toss-border)', color: 'var(--toss-text)' }}>
            <ArrowLeftRight size={26} strokeWidth={2} />
            <span className="text-[14px] font-bold">교환</span>
            <span className="text-[11px]" style={{ color: 'var(--toss-text-secondary)' }}>토큰 스왑</span>
          </Link>
          <Link href="/wallet/withdraw" className="rounded-2xl p-4 flex flex-col gap-1 transition active:scale-[0.98] border" style={{ backgroundColor: 'var(--toss-card)', borderColor: 'var(--toss-border)', color: 'var(--toss-text)' }}>
            <Upload size={26} strokeWidth={2} />
            <span className="text-[14px] font-bold">출금</span>
            <span className="text-[11px]" style={{ color: 'var(--toss-text-secondary)' }}>계좌 이체</span>
          </Link>
        </div>

        {/* 3. 거래 내역 */}
        <div className="mb-6">
          <h3 className="text-[15px] font-bold mb-3" style={{ color: 'var(--toss-text)' }}>거래 내역</h3>
          <p className="text-[11px] mb-2" style={{ color: 'var(--toss-text-secondary)' }}>정산·원장 기반</p>
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: UPBIT.panel, border: `1px solid ${UPBIT.border}` }}>
            {loading ? (
              <div className="py-12 px-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : error ? (
              <div className="py-12 text-center">
                <p className="text-[14px] mb-3" style={{ color: UPBIT.dim }}>내역을 불러올 수 없습니다.</p>
                <button onClick={refetch} className="px-4 py-2 rounded-lg text-[14px] font-semibold" style={{ backgroundColor: UPBIT.bid, color: '#fff' }}>
                  다시 시도
                </button>
              </div>
            ) : summary.entries.length === 0 ? (
              <div className="py-12 text-center text-[14px]" style={{ color: UPBIT.dim }}>거래 내역이 없습니다.</div>
            ) : (
              summary.entries.slice(0, 15).map((l: LedgerEntry) => (
                <div key={l.id} className="flex justify-between items-center px-4 py-4" style={{ borderBottom: `1px solid ${UPBIT.border}` }}>
                  <div>
                    <div className="font-semibold text-[14px]" style={{ color: UPBIT.text }}>
                      {l.entry_type === 'CASH_DEBIT' ? '투자' : l.entry_type === 'ASSET_CREDIT' ? '지분' : '입금'}
                    </div>
                    <div className="text-[12px] mt-0.5" style={{ color: UPBIT.dim }}>{new Date(l.created_at).toLocaleString('ko-KR')}</div>
                  </div>
                  <div className="text-right">
                    {l.entry_type === 'CASH_DEBIT' && (
                      <span className="font-bold text-[14px] tabular-nums" style={{ color: UPBIT.ask }}>-{Math.abs(Number(l.amount)).toLocaleString()}원</span>
                    )}
                    {l.entry_type === 'CASH_CREDIT' && (
                      <span className="font-bold text-[14px] tabular-nums" style={{ color: UPBIT.positive }}>+{Number(l.amount).toLocaleString()}원</span>
                    )}
                    {l.entry_type === 'ASSET_CREDIT' && (
                      <span className="font-bold text-[14px] tabular-nums" style={{ color: UPBIT.positive }}>+{Number(l.quantity).toLocaleString()}주</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <details className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--toss-card)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <summary className="px-4 py-4 text-[13px] font-semibold cursor-pointer" style={{ color: 'var(--toss-text-secondary)' }}>입출금 안내</summary>
          <div className="px-4 pb-4 pt-0 space-y-2 text-[13px]">
            <div className="flex justify-between"><span style={{ color: 'var(--toss-text-secondary)' }}>입금 수수료</span><span style={{ color: 'var(--toss-text)' }}>무료</span></div>
            <div className="flex justify-between"><span style={{ color: 'var(--toss-text-secondary)' }}>출금 수수료</span><span style={{ color: 'var(--toss-text)' }}>1건당 1,000원</span></div>
          </div>
        </details>
      </main>
    </div>
  );
}

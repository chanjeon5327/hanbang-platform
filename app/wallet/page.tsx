'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Download, ArrowLeftRight, Upload } from 'lucide-react';
import { useWalletLedger, type LedgerEntry } from '@/hooks/useWalletLedger';
import { formatKrw, formatRate } from '@/lib/utils/format';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';

const ROYAL = { bg: 'var(--bg)', card: 'var(--card)', blue: 'var(--royal-blue)', text: 'var(--text)', secondary: 'var(--text-secondary)', border: 'var(--border)', positive: 'var(--emerald)', negative: 'var(--accent-loss)' };

type InvestSummary = {
  totalInvest: number;
  cashBalance: number;
  totalValue: number;
  unrealizedPnl: number;
  unrealizedRate: number;
  holdingsValue: number;
};

type WalletSummaryApi = {
  cashBalance: number;
  totalAssets: number;
  totalDividend: number;
  recentDividends: { id: string; amount: number; created_at: string }[];
  unrealizedPnl: number;
  unrealizedRate: number;
};

export default function Wallet() {
  const { summary, loading, error, refetch } = useWalletLedger();
  const [investSummary, setInvestSummary] = useState<InvestSummary | null>(null);
  const [walletSummary, setWalletSummary] = useState<WalletSummaryApi | null>(null);

  const fetchInvestSummary = React.useCallback(() => {
    fetch('/api/wallet/invest-summary', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setInvestSummary(d))
      .catch(() => setInvestSummary(null));
  }, []);

  const fetchWalletSummary = React.useCallback(() => {
    fetch('/api/wallet/summary', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setWalletSummary(d))
      .catch(() => setWalletSummary(null));
  }, []);

  useEffect(() => {
    fetchInvestSummary();
    fetchWalletSummary();
  }, [fetchInvestSummary, fetchWalletSummary, loading]);

  useEffect(() => {
    const onRefresh = () => {
      fetchInvestSummary();
      fetchWalletSummary();
    };
    window.addEventListener('wallet-refresh', onRefresh);
    window.addEventListener('invest-success', onRefresh);
    return () => {
      window.removeEventListener('wallet-refresh', onRefresh);
      window.removeEventListener('invest-success', onRefresh);
    };
  }, [fetchInvestSummary, fetchWalletSummary]);

  const totalDisplay = investSummary?.totalValue ?? walletSummary?.totalAssets ?? summary.cashBalance;
  const displayReturn =
    investSummary && investSummary.holdingsValue > 0
      ? { amount: investSummary.unrealizedPnl, rate: investSummary.unrealizedRate }
      : walletSummary && (walletSummary.unrealizedPnl !== 0 || walletSummary.unrealizedRate !== 0)
        ? { amount: walletSummary.unrealizedPnl, rate: walletSummary.unrealizedRate }
        : null;

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--bg)' }}>
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
      <header className="sticky top-0 z-50 px-4 py-3 flex items-center" style={{ backgroundColor: 'var(--bg)' }}>
        <Link href="/" className="text-[14px] font-medium" style={{ color: 'var(--text-secondary)' }}>‹ 뒤로</Link>
        <h1 className="flex-1 text-center text-[17px] font-bold" style={{ color: 'var(--text)' }}>엔젤 자산</h1>
        <span className="w-10" />
      </header>

      <main className="px-4 pt-2 pb-8">
        {/* 0. KPI 3개 */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="rounded-xl p-4 card" style={{ backgroundColor: 'var(--card)' }}>
            <div className="text-[11px] mb-1" style={{ color: 'var(--text-secondary)' }}>총자산</div>
            {loading ? <Skeleton className="h-5 w-16" /> : <div className="text-[14px] font-bold tabular-nums" style={{ color: 'var(--text)' }}>{formatKrw(walletSummary?.totalAssets ?? totalDisplay)}</div>}
          </div>
          <div className="rounded-xl p-4 card" style={{ backgroundColor: 'var(--card)' }}>
            <div className="text-[11px] mb-1" style={{ color: 'var(--text-secondary)' }}>누적배당</div>
            {loading ? <Skeleton className="h-5 w-16" /> : <div className="text-[14px] font-bold tabular-nums text-profit" style={{ color: 'var(--emerald)' }}>{formatKrw(walletSummary?.totalDividend ?? 0)}</div>}
          </div>
          <div className="rounded-xl p-4 card" style={{ backgroundColor: 'var(--card)' }}>
            <div className="text-[11px] mb-1" style={{ color: 'var(--text-secondary)' }}>미실현손익</div>
            {loading ? <Skeleton className="h-5 w-16" /> : <div className="text-[14px] font-bold tabular-nums" style={{ color: (walletSummary?.unrealizedPnl ?? 0) >= 0 ? 'var(--emerald)' : 'var(--accent-loss)' }}>{formatKrw(walletSummary?.unrealizedPnl ?? 0)}</div>}
          </div>
        </div>

        {/* 1. 총 평가 자산 */}
        <div className="rounded-[16px] p-6 mb-6 card" style={{ backgroundColor: 'var(--card)', boxShadow: 'var(--shadow-md)' }}>
          <div className="text-[13px] font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>총 평가 자산</div>
          {loading ? (
            <Skeleton className="h-8 w-40 mb-2" />
          ) : error ? (
            <div className="flex items-center gap-2">
              <span className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>조회 실패</span>
              <button onClick={refetch} className="text-[13px] font-semibold" style={{ color: 'var(--royal-blue)' }}>다시 시도</button>
            </div>
          ) : (
            <>
              <div className="text-[28px] font-bold tracking-tight tabular-nums metric-xl" style={{ color: 'var(--text)' }}>
                {formatKrw(totalDisplay)}
              </div>
              {displayReturn && (
                <div className="text-[14px] font-semibold mt-1 tabular-nums" style={{ color: displayReturn.amount >= 0 ? ROYAL.positive : ROYAL.negative }}>
                  {displayReturn.amount >= 0 ? '+' : ''}{formatRate(displayReturn.rate)}
                  <span className="text-[12px] ml-1 font-normal opacity-90">
                    ({displayReturn.amount >= 0 ? '+' : ''}{formatKrw(displayReturn.amount)})
                  </span>
                </div>
              )}
              {summary.fetchedAt && (
                <p className="text-[11px] mt-1" style={{ color: 'var(--text-secondary)' }}>
                  집계 기준 {new Date(summary.fetchedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
              <div className="mt-4 pt-4 flex gap-6 text-[13px]" style={{ borderTop: '1px solid var(--border)' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>예수금 </span>
                  <span className="font-semibold tabular-nums metric" style={{ color: 'var(--text)' }}>{formatKrw(summary.cashBalance)}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>투자원금 </span>
                  <span className="font-semibold tabular-nums metric" style={{ color: 'var(--text)' }}>{formatKrw(summary.investedPrincipal)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* 2. CTA */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <Link href="/wallet/deposit" className="rounded-[16px] p-4 flex flex-col gap-1 tap-scale" style={{ backgroundColor: 'var(--royal-blue)', color: 'var(--card)', boxShadow: 'var(--shadow-royal)' }}>
            <Download size={26} strokeWidth={2} />
            <span className="text-[14px] font-bold">입금</span>
            <span className="text-[11px] opacity-90">KRW 충전</span>
          </Link>
          <Link href="/wallet/swap" className="rounded-[16px] p-4 flex flex-col gap-1 tap-scale border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }}>
            <ArrowLeftRight size={26} strokeWidth={2} />
            <span className="text-[14px] font-bold">교환</span>
            <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>토큰 스왑</span>
          </Link>
          <Link href="/wallet/withdraw" className="rounded-[16px] p-4 flex flex-col gap-1 tap-scale border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }}>
            <Upload size={26} strokeWidth={2} />
            <span className="text-[14px] font-bold">출금</span>
            <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>계좌 이체</span>
          </Link>
        </div>

        {/* 2.5 최근 배당 5건 */}
        <div className="mb-6">
          <h3 className="text-[15px] font-bold mb-3" style={{ color: 'var(--text)' }}>최근 배당</h3>
          <div className="rounded-[16px] overflow-hidden" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
            {loading ? (
              <div className="py-8 px-4 space-y-2">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : !walletSummary?.recentDividends?.length ? (
              <EmptyState title="아직 배당 내역이 없습니다" description="배당 지급 시 여기에 표시됩니다" />
            ) : (
              walletSummary.recentDividends.map((d) => (
                <div key={d.id} className="flex justify-between items-center px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div className="font-semibold text-[14px]" style={{ color: 'var(--text)' }}>배당</div>
                    <div className="text-[12px]" style={{ color: 'var(--text-muted)' }}>{new Date(d.created_at).toLocaleString('ko-KR')}</div>
                  </div>
                  <span className="font-bold text-[14px] tabular-nums text-profit">+{formatKrw(Number(d.amount))}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 3. 거래 내역 */}
        <div className="mb-6">
          <h3 className="text-[15px] font-bold mb-3" style={{ color: 'var(--text)' }}>거래 내역</h3>
          <p className="text-[11px] mb-2" style={{ color: 'var(--text-secondary)' }}>정산·원장 기반</p>
          <div className="rounded-[16px] overflow-hidden" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
            {loading ? (
              <div className="py-12 px-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : error ? (
              <div className="py-12 text-center">
                <p className="text-[14px] mb-3" style={{ color: 'var(--text-muted)' }}>내역을 불러올 수 없습니다.</p>
                <button onClick={refetch} className="px-4 py-2 rounded-lg text-[14px] font-semibold" style={{ backgroundColor: 'var(--royal-blue)', color: '#fff' }}>
                  다시 시도
                </button>
              </div>
            ) : summary.entries.length === 0 ? (
              <EmptyState
                title="아직 체결 내역이 없습니다"
                description="엔젤로 참여하면 여기에 내역이 표시됩니다"
                cta={{ label: '수익권 둘러보기', onClick: () => window.location.href = '/active-invest' }}
              />
            ) : (
              summary.entries.slice(0, 15).map((l: LedgerEntry) => (
                <div key={l.id} className="flex justify-between items-center px-4 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div className="font-semibold text-[14px]" style={{ color: 'var(--text)' }}>
                      {l.entry_type === 'CASH_DEBIT' ? '투자' : l.entry_type === 'ASSET_CREDIT' ? '지분' : '입금'}
                    </div>
                    <div className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{new Date(l.created_at).toLocaleString('ko-KR')}</div>
                  </div>
                  <div className="text-right">
                    {l.entry_type === 'CASH_DEBIT' && (
                      <span className="font-bold text-[14px] tabular-nums text-loss">-{formatKrw(Math.abs(Number(l.amount)))}</span>
                    )}
                    {l.entry_type === 'CASH_CREDIT' && (
                      <span className="font-bold text-[14px] tabular-nums text-profit">+{formatKrw(Number(l.amount))}</span>
                    )}
                    {l.entry_type === 'ASSET_CREDIT' && (
                      <span className="font-bold text-[14px] tabular-nums text-profit">+{Number(l.quantity).toLocaleString()}주</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <details className="rounded-[16px] overflow-hidden card">
          <summary className="px-4 py-4 text-[13px] font-semibold cursor-pointer" style={{ color: 'var(--text-secondary)' }}>입출금 안내</summary>
          <div className="px-4 pb-4 pt-0 space-y-2 text-[13px]">
            <div className="flex justify-between"><span style={{ color: 'var(--text-secondary)' }}>입금 수수료</span><span style={{ color: 'var(--text)' }}>무료</span></div>
            <div className="flex justify-between"><span style={{ color: 'var(--text-secondary)' }}>출금 수수료</span><span style={{ color: 'var(--text)' }}>1건당 1,000원</span></div>
          </div>
        </details>
      </main>
    </div>
  );
}

'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Download, ArrowLeftRight, Upload } from 'lucide-react';
import { useWalletLedger, type LedgerEntry } from '@/hooks/useWalletLedger';
import { formatKrw, formatRate } from '@/lib/utils/format';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/components/auth/AuthProvider';

const LAST_SEEN_DIVIDEND_KEY = 'hb_last_seen_dividend_id';

const ROYAL = { positive: 'var(--emerald)', negative: 'var(--accent-loss)' };

type InvestSummary = {
  totalInvest: number;
  cashBalance: number;
  totalValue: number;
  unrealizedPnl: number;
  unrealizedRate: number;
  holdingsValue: number;
  latestDividendId?: string | null;
  latestDividendAt?: string | null;
};

type WalletSummaryApi = {
  cashBalance: number;
  totalAssets: number;
  totalDividend: number;
  recentDividends: { id: string; amount: number; created_at: string }[];
  unrealizedPnl: number;
  unrealizedRate: number;
};

type PortfolioPosition = {
  asset_id: string;
  title: string;
  quantity: number;
  avg_price: number;
  total_cost: number;
  current_value: number;
  unrealized_pnl: number;
  unrealized_rate: number;
};

type PortfolioApi = {
  cash_balance: number;
  total_invested: number;
  total_value: number;
  total_dividend: number;
  total_return_rate: number;
  positions: PortfolioPosition[];
};

export default function Wallet() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { summary, loading, error, refetch } = useWalletLedger();
  const [investSummary, setInvestSummary] = useState<InvestSummary | null>(null);
  const [walletSummary, setWalletSummary] = useState<WalletSummaryApi | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioApi | null>(null);
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [portfolioError, setPortfolioError] = useState<string | null>(null);

  const fetchInvestSummary = useCallback(() => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    fetch('/api/wallet/invest-summary', { cache: 'no-store', signal: ctrl.signal })
      .then((r) => {
        if (r.status === 401) router.replace('/login?next=/wallet');
        return r.ok ? r.json() : null;
      })
      .then((d) => d && setInvestSummary(d))
      .catch(() => setInvestSummary(null))
      .finally(() => clearTimeout(t));
  }, [router]);

  const fetchWalletSummary = useCallback(() => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    fetch('/api/wallet/summary', { cache: 'no-store', signal: ctrl.signal })
      .then((r) => {
        if (r.status === 401) router.replace('/login?next=/wallet');
        return r.ok ? r.json() : null;
      })
      .then((d) => d && setWalletSummary(d))
      .catch(() => setWalletSummary(null))
      .finally(() => clearTimeout(t));
  }, [router]);

  const fetchPortfolio = useCallback(() => {
    setPortfolioError(null);
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    fetch('/api/dashboard/portfolio', { cache: 'no-store', signal: ctrl.signal })
      .then((r) => {
        if (r.status === 401) router.replace('/login?next=/wallet');
        if (!r.ok) throw new Error('조회 실패');
        return r.json();
      })
      .then((d) => setPortfolio(d))
      .catch((e) => {
        setPortfolioError(e instanceof Error ? e.message : '오류');
        setPortfolio(null);
      })
      .finally(() => {
        clearTimeout(t);
        setPortfolioLoading(false);
      });
  }, [router]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login?next=/wallet');
      return;
    }
    fetchInvestSummary();
    fetchWalletSummary();
    fetchPortfolio();
  }, [user, authLoading, fetchInvestSummary, fetchWalletSummary, fetchPortfolio, loading]);

  useEffect(() => {
    const onRefresh = () => {
      fetchInvestSummary();
      fetchWalletSummary();
      fetchPortfolio();
    };
    window.addEventListener('wallet-refresh', onRefresh);
    window.addEventListener('invest-success', onRefresh);
    return () => {
      window.removeEventListener('wallet-refresh', onRefresh);
      window.removeEventListener('invest-success', onRefresh);
    };
  }, [fetchInvestSummary, fetchWalletSummary, fetchPortfolio]);

  useEffect(() => {
    if (typeof window === 'undefined' || !investSummary || loading) return;
    const latestId = investSummary.latestDividendId;
    if (!latestId) return;
    try {
      const lastSeen = localStorage.getItem(LAST_SEEN_DIVIDEND_KEY);
      if (lastSeen !== latestId) {
        toast('배당금이 지갑에 반영되었습니다.');
        localStorage.setItem(LAST_SEEN_DIVIDEND_KEY, latestId);
      }
    } catch {
      toast('배당금이 지갑에 반영되었습니다.');
    }
  }, [investSummary, loading, toast]);

  const totalDisplay =
    portfolio?.total_value ??
    investSummary?.totalValue ??
    walletSummary?.totalAssets ??
    summary.cashBalance;
  const displayReturn =
    investSummary && investSummary.holdingsValue > 0
      ? { amount: investSummary.unrealizedPnl, rate: investSummary.unrealizedRate }
      : portfolio && portfolio.total_invested > 0
        ? {
            amount: portfolio.total_value - portfolio.total_invested + (portfolio.total_dividend ?? 0),
            rate: portfolio.total_return_rate ?? 0,
          }
        : walletSummary && (walletSummary.unrealizedPnl !== 0 || walletSummary.unrealizedRate !== 0)
          ? { amount: walletSummary.unrealizedPnl, rate: walletSummary.unrealizedRate }
          : null;
  const holdingsCount = portfolio?.positions?.length ?? 0;
  const isLoading = loading || portfolioLoading;

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <div className="text-sm text-black/55">{authLoading ? '로딩 중...' : '리다이렉트 중...'}</div>
      </div>
    );
  }

  return (
    <div className="pb-16 bg-[#F7F8FA] text-[#0B1120]">
      <header className="sticky top-0 z-50 px-4 py-2.5 flex items-center bg-[#F7F8FA] border-b border-black/5">
        <Link href="/" className="text-[13px] font-medium text-black/60 hover:text-black">
          ‹ 뒤로
        </Link>
        <h1 className="flex-1 text-center text-[16px] font-bold">보유 자산</h1>
        <span className="w-10" />
      </header>

      <div className="pt-3 pb-6 px-4 max-w-2xl mx-auto">
        {/* 자산 요약 카드 4개 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          <div className="rounded-xl px-3 py-3 bg-white border border-black/10 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
            <div className="text-[10px] text-black/55 mb-0.5">총자산</div>
            {isLoading ? (
              <Skeleton className="h-5 w-20" />
            ) : (
              <div className="text-sm font-extrabold tabular-nums">{formatKrw(totalDisplay)}</div>
            )}
          </div>
          <div className="rounded-xl px-3 py-3 bg-white border border-black/10 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
            <div className="text-[10px] text-black/55 mb-0.5">미실현손익</div>
            {isLoading ? (
              <Skeleton className="h-5 w-16" />
            ) : (
              <div
                className="text-sm font-extrabold tabular-nums"
                style={{
                  color:
                    (investSummary?.unrealizedPnl ?? portfolio?.positions?.reduce((s, p) => s + p.unrealized_pnl, 0) ?? 0) >= 0
                      ? 'var(--emerald)'
                      : 'var(--accent-loss)',
                }}
              >
                {(investSummary?.unrealizedPnl ?? portfolio?.positions?.reduce((s, p) => s + p.unrealized_pnl, 0) ?? 0) >= 0 ? '+' : ''}
                {formatKrw(investSummary?.unrealizedPnl ?? portfolio?.positions?.reduce((s, p) => s + p.unrealized_pnl, 0) ?? 0)}
              </div>
            )}
          </div>
          <div className="rounded-xl px-3 py-3 bg-white border border-black/10 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
            <div className="text-[10px] text-black/55 mb-0.5">수익률</div>
            {isLoading ? (
              <Skeleton className="h-5 w-14" />
            ) : displayReturn ? (
              <div
                className="text-sm font-extrabold tabular-nums"
                style={{ color: displayReturn.rate >= 0 ? ROYAL.positive : ROYAL.negative }}
              >
                {displayReturn.rate >= 0 ? '+' : ''}{formatRate(displayReturn.rate)}
              </div>
            ) : (
              <div className="text-sm font-extrabold tabular-nums text-black/50">—</div>
            )}
          </div>
          <div className="rounded-xl px-3 py-3 bg-white border border-black/10 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
            <div className="text-[10px] text-black/55 mb-0.5">보유종목</div>
            {isLoading ? (
              <Skeleton className="h-5 w-8" />
            ) : (
              <div className="text-sm font-extrabold tabular-nums">{holdingsCount}개</div>
            )}
          </div>
        </div>

        {/* 총 평가 자산 */}
        <div className="rounded-2xl px-4 py-4 mb-4 bg-white border border-black/10 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
          <div className="text-[11px] font-medium text-black/55 mb-0.5">총 평가 자산</div>
          {isLoading ? (
            <Skeleton className="h-8 w-40 mb-2" />
          ) : error ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-black/55">조회 실패</span>
              <button onClick={refetch} className="text-sm font-semibold text-[#2563EB]">
                다시 시도
              </button>
            </div>
          ) : (
            <>
              <div className="text-[22px] font-extrabold tracking-tight tabular-nums">{formatKrw(totalDisplay)}</div>
              {displayReturn && (
                <div
                  className="text-[13px] font-semibold mt-0.5 tabular-nums"
                  style={{ color: displayReturn.amount >= 0 ? ROYAL.positive : ROYAL.negative }}
                >
                  {displayReturn.amount >= 0 ? '+' : ''}{formatRate(displayReturn.rate)}
                  <span className="text-[11px] ml-1 font-normal opacity-90">
                    ({displayReturn.amount >= 0 ? '+' : ''}{formatKrw(displayReturn.amount)})
                  </span>
                </div>
              )}
              {summary.fetchedAt && (
                <p className="text-[10px] mt-0.5 text-black/40">
                  기준 {new Date(summary.fetchedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
              <div className="mt-3 pt-3 flex gap-5 text-[13px] border-t border-black/10">
                <div>
                  <span className="text-black/55">예수금 </span>
                  <span className="font-semibold tabular-nums">{formatKrw(summary.cashBalance)}</span>
                </div>
                <div>
                  <span className="text-black/55">투자원금 </span>
                  <span className="font-semibold tabular-nums">{formatKrw(summary.investedPrincipal)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* CTA */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <Link
            href="/wallet/deposit"
            className="rounded-xl px-3 py-3 flex flex-col gap-0.5 bg-[#2563EB] text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)] hover:bg-[#1D4ED8] transition"
          >
            <Download size={20} strokeWidth={2} />
            <span className="text-[13px] font-bold mt-0.5">입금</span>
            <span className="text-[11px] opacity-90">KRW 충전</span>
          </Link>
          <Link
            href="/wallet/swap"
            className="rounded-xl px-3 py-3 flex flex-col gap-0.5 bg-white border border-black/10 hover:bg-black/5 transition"
          >
            <ArrowLeftRight size={20} strokeWidth={2} />
            <span className="text-[13px] font-bold mt-0.5">교환</span>
            <span className="text-[11px] text-black/55">토큰 스왑</span>
          </Link>
          <Link
            href="/wallet/withdraw"
            className="rounded-xl px-3 py-3 flex flex-col gap-0.5 bg-white border border-black/10 hover:bg-black/5 transition"
          >
            <Upload size={20} strokeWidth={2} />
            <span className="text-[13px] font-bold mt-0.5">출금</span>
            <span className="text-[11px] text-black/55">계좌 이체</span>
          </Link>
        </div>

        {/* 보유 종목 */}
        <div className="mb-4">
          <h3 className="text-[14px] font-extrabold mb-2">보유 종목</h3>
          <div className="rounded-2xl overflow-hidden bg-white border border-black/10 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
            {portfolioLoading ? (
              <div className="py-6 px-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : portfolioError ? (
              <div className="py-8 text-center">
                <p className="text-[13px] text-black/55 mb-3">보유 종목을 불러올 수 없습니다.</p>
                <button
                  onClick={fetchPortfolio}
                  className="px-4 py-2 rounded-xl text-[13px] font-semibold bg-[#2563EB] text-white"
                >
                  다시 시도
                </button>
              </div>
            ) : !portfolio?.positions?.length ? (
              <EmptyState
                title="첫 번째 콘텐츠 자산을 소유해보세요"
                description="마켓에서 수익권을 매수하면 보유 종목이 여기에 표시됩니다"
                cta={{ label: '마켓 둘러보기', onClick: () => router.push('/market') }}
              />
            ) : (
              <div className="divide-y divide-black/10">
                {portfolio.positions.map((p) => (
                  <Link
                    key={p.asset_id}
                    href={`/market/${p.asset_id}`}
                    className="flex justify-between items-center px-4 py-3 hover:bg-black/5 transition"
                  >
                    <div>
                      <div className="font-semibold text-sm">{p.title}</div>
                      <div className="text-xs text-black/55 mt-0.5">
                        {p.quantity.toLocaleString()}주 · 평균 {formatKrw(p.avg_price)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold tabular-nums text-sm">{formatKrw(p.current_value)}</div>
                      <div
                        className="text-xs font-semibold tabular-nums"
                        style={{ color: p.unrealized_pnl >= 0 ? ROYAL.positive : ROYAL.negative }}
                      >
                        {p.unrealized_pnl >= 0 ? '+' : ''}{formatKrw(p.unrealized_pnl)} ({p.unrealized_rate >= 0 ? '+' : ''}{formatRate(p.unrealized_rate)})
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 최근 배당 */}
        <div className="mb-4">
          <h3 className="text-[14px] font-extrabold mb-2">최근 배당</h3>
          <div className="rounded-2xl overflow-hidden bg-white border border-black/10 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
            {isLoading ? (
              <div className="py-6 px-4 space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : !walletSummary?.recentDividends?.length ? (
              <EmptyState title="배당 내역이 아직 없습니다" description="보유 종목의 수익 정산 후 매월 25일 지급됩니다" />
            ) : (
              walletSummary.recentDividends.map((d) => (
                <div
                  key={d.id}
                  className="flex justify-between items-center px-4 py-2.5 border-b border-black/10 last:border-0"
                >
                  <div>
                    <div className="font-semibold text-sm">배당</div>
                    <div className="text-xs text-black/50">{new Date(d.created_at).toLocaleString('ko-KR')}</div>
                  </div>
                  <span className="font-bold text-sm tabular-nums text-emerald-600">+{formatKrw(Number(d.amount))}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 거래 기록 */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2 mb-2">
            <h3 className="text-[14px] font-extrabold">거래 기록</h3>
            <span className="text-[11px] text-black/45">정산·원장 기반</span>
          </div>
          <div className="rounded-2xl overflow-hidden bg-white border border-black/10 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
            {loading ? (
              <div className="py-6 px-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : error ? (
              <div className="py-8 text-center">
                <p className="text-[13px] mb-3 text-black/55">내역을 불러올 수 없습니다.</p>
                <button onClick={refetch} className="px-4 py-2 rounded-xl text-[13px] font-semibold bg-[#2563EB] text-white">
                  다시 시도
                </button>
              </div>
            ) : summary.entries.length === 0 ? (
              <EmptyState
                title="거래 내역이 아직 없습니다"
                description="매수·매도 체결 시 여기에 기록됩니다"
                cta={{ label: '마켓 둘러보기', onClick: () => router.push('/market') }}
              />
            ) : (
              summary.entries.slice(0, 15).map((l: LedgerEntry) => (
                <div key={l.id} className="flex justify-between items-center px-4 py-3 border-b border-black/10 last:border-0">
                  <div>
                    <div className="font-semibold text-sm">
                      {l.entry_type === 'CASH_DEBIT' ? '투자' : l.entry_type === 'ASSET_CREDIT' ? '지분' : '입금'}
                    </div>
                    <div className="text-xs text-black/50 mt-0.5">{new Date(l.created_at).toLocaleString('ko-KR')}</div>
                  </div>
                  <div className="text-right">
                    {l.entry_type === 'CASH_DEBIT' && (
                      <span className="font-bold text-sm tabular-nums text-red-600">-{formatKrw(Math.abs(Number(l.amount)))}</span>
                    )}
                    {l.entry_type === 'CASH_CREDIT' && (
                      <span className="font-bold text-sm tabular-nums text-emerald-600">+{formatKrw(Number(l.amount))}</span>
                    )}
                    {l.entry_type === 'ASSET_CREDIT' && (
                      <span className="font-bold text-sm tabular-nums text-emerald-600">+{Number(l.quantity).toLocaleString()}주</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <details className="rounded-2xl overflow-hidden bg-white border border-black/10">
          <summary className="px-4 py-4 text-sm font-semibold cursor-pointer text-black/60">
            입출금 안내
          </summary>
          <div className="px-4 pb-4 pt-0 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-black/55">입금 수수료</span>
              <span>무료</span>
            </div>
            <div className="flex justify-between">
              <span className="text-black/55">출금 수수료</span>
              <span>1건당 1,000원</span>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}

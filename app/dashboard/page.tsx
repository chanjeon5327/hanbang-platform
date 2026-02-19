/**
 * ============================================================================
 * /dashboard — 토스증권형 "내 자산/내 주식" 데모 v1
 * ============================================================================
 *
 * 모바일 우선, PC는 max-w 컨테이너로 자연스럽게 확장
 * - 상단 요약 카드 (총 자산, 오늘 변동, 나의 팬심 pill)
 * - 미니 차트 placeholder
 * - 내 주식 리스트
 * - CTA: 입금하기 / 거래하러 가기
 * - 비로그인: 민감 값 잠금 + 로그인 유도
 *
 * API: /api/wallet/summary, /api/dashboard/portfolio (fallback mock)
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { formatKrw, formatRate } from '@/lib/utils/format';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import HoldingsList from '@/components/dashboard/HoldingsList';

const HB_FANDOM_KEY = 'hb_fandom';

type WalletSummary = {
  cashBalance: number;
  totalAssets: number;
  unrealizedPnl: number;
  unrealizedRate: number;
};

type Portfolio = {
  asset_id: string;
  title: string;
  quantity: number;
  avg_price: number;
  total_cost: number;
  current_value: number;
  unrealized_pnl: number;
  unrealized_rate: number;
}[];

function SummaryCardSkeleton() {
  return (
    <>
      <div className="h-8 w-32 rounded animate-pulse mb-2" style={{ backgroundColor: 'var(--border)' }} />
      <div className="h-4 w-24 rounded animate-pulse mb-3" style={{ backgroundColor: 'var(--border)' }} />
      <div className="h-5 w-16 rounded animate-pulse" style={{ backgroundColor: 'var(--border)' }} />
    </>
  );
}

function ChartPlaceholder() {
  return (
    <div
      className="rounded-2xl p-4"
      style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
    >
      <div className="h-32 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
        <span className="caption" style={{ color: 'var(--text-secondary)' }}>
          차트 영역 (준비중)
        </span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  const [walletSummary, setWalletSummary] = useState<WalletSummary | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [investSummary, setInvestSummary] = useState<{
    totalValue: number;
    unrealizedPnl: number;
    unrealizedRate: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [fandom, setFandom] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(HB_FANDOM_KEY);
      setFandom(stored ?? '');
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      setWalletSummary(null);
      setPortfolio(null);
      setInvestSummary(null);
      return;
    }

    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);

    Promise.all([
      fetch('/api/wallet/summary', { cache: 'no-store', signal: ctrl.signal }).then((r) =>
        r.ok ? r.json() : null
      ),
      fetch('/api/dashboard/portfolio', { cache: 'no-store', signal: ctrl.signal }).then((r) =>
        r.ok ? r.json() : null
      ),
      fetch('/api/wallet/invest-summary', { cache: 'no-store', signal: ctrl.signal }).then((r) =>
        r.ok ? r.json() : null
      ),
    ])
      .then(([ws, p, inv]) => {
        setWalletSummary(ws);
        setPortfolio(p?.positions ?? null);
        setInvestSummary(inv);
      })
      .catch(() => {
        setWalletSummary(null);
        setPortfolio(null);
        setInvestSummary(null);
      })
      .finally(() => {
        clearTimeout(t);
        setLoading(false);
      });

    return () => ctrl.abort();
  }, [isLoggedIn]);

  const totalAssets =
    investSummary?.totalValue ??
    walletSummary?.totalAssets ??
    0;
  const todayChange = investSummary?.unrealizedPnl ?? walletSummary?.unrealizedPnl ?? 0;
  const todayRate = investSummary?.unrealizedRate ?? walletSummary?.unrealizedRate ?? 0;
  const positions = portfolio ?? [];

  const holdings = positions.map((p) => ({
    asset_id: p.asset_id,
    title: p.title,
    quantity: p.quantity,
    avg_price: p.avg_price,
    current_value: p.current_value,
    unrealized_rate: p.unrealized_rate ?? 0,
  }));

  return (
    <div className="pb-24" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="mx-auto max-w-[480px] px-4">
        <DashboardHeader />

        {/* 1) 상단 요약 카드 */}
        <div
          className="rounded-2xl p-4 mb-4"
          style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
        >
          {loading ? (
            <SummaryCardSkeleton />
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="caption" style={{ color: 'var(--text-secondary)' }}>
                  총 자산
                </span>
                {fandom.trim() && (
                  <span
                    className="px-2 py-0.5 rounded-full caption text-white"
                    style={{ backgroundColor: 'var(--royal-blue)' }}
                  >
                    팬: {fandom.trim()}
                  </span>
                )}
              </div>
              <div className="font-bold tabular-nums" style={{ fontSize: 28, color: 'var(--text)' }}>
                {isLoggedIn ? formatKrw(totalAssets) : '●●●●●●'}
              </div>
              <div
                className="caption tabular-nums mt-1"
                style={{
                  color:
                    isLoggedIn
                      ? todayChange >= 0
                        ? 'var(--emerald)'
                        : 'var(--accent-loss)'
                      : 'var(--text-secondary)',
                }}
              >
                {isLoggedIn
                  ? todayChange !== 0 || todayRate !== 0
                    ? `${todayChange >= 0 ? '+' : ''}${formatKrw(todayChange)} (${formatRate(todayRate)})`
                    : '오늘 변동 없음'
                  : '—'}
              </div>
            </>
          )}
        </div>

        {/* 2) 미니 차트 placeholder */}
        <div className="mb-4">
          <ChartPlaceholder />
        </div>

        {/* 3) 내 주식 리스트 */}
        <div className="mb-4">
          <h2 className="font-semibold mb-3" style={{ fontSize: 14, color: 'var(--text)' }}>
            내 주식
          </h2>
          <HoldingsList items={holdings} isLocked={!isLoggedIn} />
        </div>

        {/* 4) CTA 2개 */}
        <div className="flex gap-3 mb-4">
          <Link
            href="/wallet/deposit"
            className="flex-1 rounded-2xl p-4 font-semibold text-center transition active:opacity-90"
            style={{
              backgroundColor: 'var(--royal-blue)',
              color: '#fff',
              fontSize: 14,
            }}
          >
            입금하기
          </Link>
          <Link
            href="/market"
            className="flex-1 rounded-2xl p-4 font-semibold text-center transition active:opacity-90"
            style={{
              backgroundColor: 'var(--card)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              fontSize: 14,
            }}
          >
            거래하러 가기
          </Link>
        </div>

        {/* 5) 비로그인: 로그인 유도 */}
        {!isLoggedIn && (
          <div
            className="rounded-2xl p-4 text-center"
            style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <p className="body-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
              자산 정보를 확인하려면 로그인하세요
            </p>
            <Link
              href="/login"
              className="inline-block rounded-xl px-6 py-3 font-semibold text-white"
              style={{ backgroundColor: 'var(--royal-blue)', fontSize: 14 }}
            >
              로그인
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

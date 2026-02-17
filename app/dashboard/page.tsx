/**
 * ============================================================================
 * /dashboard — 투자 대시보드 (Financial Engine V1.5)
 * ============================================================================
 *
 * Toss 정적 스타일 + Upbit 정보 밀도 믹스.
 * 기존 portfolio/performance API 호환 유지 + PnL/Risk/Dividend 위젯 추가.
 *
 * 모바일 우선 레이아웃:
 * - PnL 카드 (포트폴리오 가치 + 미실현 손익)
 * - Risk 카드 (MDD + Rolling Return + Equity 차트)
 * - Dividend 카드 (이번달/누적 + 월별 바차트)
 * - 기존 4종 요약 그리드 (투자/가치/배당/수익률)
 * - 월별 배당 차트 (기존 호환)
 * - 포지션 리스트 (기존 호환)
 *
 * ============================================================================
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatKrw, formatRate } from '@/lib/utils/format';
import Skeleton from '@/components/ui/Skeleton';
import PnLCard from '@/components/dashboard/PnLCard';
import RiskCard from '@/components/dashboard/RiskCard';
import DividendCard from '@/components/dashboard/DividendCard';

type Portfolio = {
  cash_balance: number;
  total_invested: number;
  total_value: number;
  total_dividend: number;
  total_return_rate: number;
  positions: {
    asset_id: string;
    title: string;
    quantity: number;
    avg_price: number;
    total_cost: number;
    current_value: number;
    total_dividend: number;
    unrealized_pnl: number;
    unrealized_rate: number;
  }[];
};

type Performance = {
  monthly_dividends: { month: string; amount: number }[];
  asset_returns: { asset_id: string; quantity: number; return_rate: number }[];
};

export default function DashboardPage() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [performance, setPerformance] = useState<Performance | null>(null);
  const [irrData, setIrrData] = useState<{ irr?: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard/portfolio', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)),
      fetch('/api/dashboard/performance', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)),
      fetch('/api/dashboard/irr', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([p, perf, irr]) => {
        setPortfolio(p);
        setPerformance(perf);
        setIrrData(irr);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const p = portfolio ?? {
    cash_balance: 0,
    total_invested: 0,
    total_value: 0,
    total_dividend: 0,
    total_return_rate: 0,
    positions: [],
  };
  const perf = performance ?? { monthly_dividends: [], asset_returns: [] };

  return (
    <div className="pb-24" style={{ backgroundColor: 'var(--bg, #fff)' }}>
      <div className="pt-6 space-y-4">
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary, #111)' }}>
          투자 대시보드
        </h1>

        {/* ── V1.5 위젯 3종 ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PnLCard />
          <RiskCard />
          <DividendCard />
        </div>

        {/* ── 기존 4종 요약 그리드 (호환) ── */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <SummaryTile label="총 투자금" value={formatKrw(p.total_invested)} />
            <SummaryTile label="총 평가액" value={formatKrw(p.total_value)} />
            <SummaryTile
              label="배당 수익"
              value={formatKrw(p.total_dividend)}
              valueColor="var(--upbit-positive, #16a34a)"
            />
            <SummaryTile
              label="총 수익률"
              value={formatRate(irrData?.irr ?? p.total_return_rate)}
              valueColor={(irrData?.irr ?? p.total_return_rate) >= 0 ? 'var(--upbit-positive, #16a34a)' : 'var(--upbit-ask, #dc2626)'}
            />
          </div>
        )}

        {/* ── 월별 배당 차트 (기존 호환) ── */}
        {!loading && perf.monthly_dividends.length > 0 && (
          <div
            className="rounded-xl p-4 border"
            style={{ backgroundColor: 'var(--card-bg, var(--card, #fff))', borderColor: 'var(--border-color, var(--border, #e5e7eb))' }}
          >
            <div className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary, #111)' }}>
              월별 배당
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={perf.monthly_dividends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color, #e5e7eb)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${(v / 10000).toFixed(0)}만`} />
                  <Tooltip formatter={(v: number | undefined) => [formatKrw(v ?? 0), '배당']} />
                  <Bar dataKey="amount" fill="var(--upbit-bid, #3b82f6)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── 포지션 리스트 (기존 호환) ── */}
        {!loading && (
          <div className="space-y-3">
            <div className="text-sm font-semibold" style={{ color: 'var(--text-primary, #111)' }}>
              보유 종목
            </div>
            {p.positions.length === 0 ? (
              <div
                className="rounded-xl p-8 text-center text-sm border"
                style={{ backgroundColor: 'var(--card-bg, #fff)', borderColor: 'var(--border-color, #e5e7eb)', color: 'var(--text-secondary, #6b7280)' }}
              >
                보유 종목이 없습니다.
                <br />
                <Link href="/market" className="font-semibold mt-2 inline-block" style={{ color: 'var(--upbit-bid, #3b82f6)' }}>
                  마켓에서 투자하기
                </Link>
              </div>
            ) : (
              [...p.positions]
                .sort((a, b) => (b.unrealized_rate ?? 0) - (a.unrealized_rate ?? 0))
                .map((pos) => (
                  <Link
                    key={pos.asset_id}
                    href={`/market/${pos.asset_id}`}
                    className="block rounded-xl p-4 border hover:opacity-90 transition"
                    style={{ backgroundColor: 'var(--card-bg, #fff)', borderColor: 'var(--border-color, #e5e7eb)' }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-sm" style={{ color: 'var(--text-primary, #111)' }}>
                          {pos.title}
                        </div>
                        <div className="text-xs mt-1" style={{ color: 'var(--text-secondary, #6b7280)' }}>
                          {pos.quantity}주 · 평균 {formatKrw(pos.avg_price)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold tabular-nums text-sm" style={{ color: 'var(--text-primary, #111)' }}>
                          {formatKrw(pos.current_value)}
                        </div>
                        <div
                          className="text-xs tabular-nums"
                          style={{ color: pos.unrealized_rate >= 0 ? 'var(--upbit-positive, #16a34a)' : 'var(--upbit-ask, #dc2626)' }}
                        >
                          {formatRate(pos.unrealized_rate)}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/** 요약 타일 (기존 4종 그리드용) */
function SummaryTile({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div
      className="rounded-xl p-4 border"
      style={{ backgroundColor: 'var(--card-bg, var(--card, #fff))', borderColor: 'var(--border-color, var(--border, #e5e7eb))' }}
    >
      <div className="text-xs" style={{ color: 'var(--text-secondary, #6b7280)' }}>{label}</div>
      <div
        className="text-lg font-bold tabular-nums mt-1"
        style={{ color: valueColor ?? 'var(--text-primary, #111)' }}
      >
        {value}
      </div>
    </div>
  );
}

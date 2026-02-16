'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatKrw, formatRate } from '@/lib/utils/format';
import Skeleton from '@/components/ui/Skeleton';

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

  if (loading) {
    return (
      <div className="bg-white p-4">
        <h1 className="text-xl font-bold mb-4">?? ????</h1>
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

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
    <div className="bg-white pb-24">
      <div className="pt-6">
        <h1 className="h2 font-bold mb-6">?? ????</h1>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-xl p-4 border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="caption" style={{ color: 'var(--text-secondary)' }}>? ???</div>
            <div className="body-lg font-bold tabular-nums mt-1" style={{ color: 'var(--text)' }}>
              {formatKrw(p.total_invested)}
            </div>
          </div>
          <div className="rounded-xl p-4 border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="caption" style={{ color: 'var(--text-secondary)' }}>? ???</div>
            <div className="body-lg font-bold tabular-nums mt-1" style={{ color: 'var(--text)' }}>
              {formatKrw(p.total_value)}
            </div>
          </div>
          <div className="rounded-xl p-4 border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="caption" style={{ color: 'var(--text-secondary)' }}>?? ??</div>
            <div className="body-lg font-bold tabular-nums mt-1" style={{ color: 'var(--upbit-positive)' }}>
              {formatKrw(p.total_dividend)}
            </div>
          </div>
          <div className="rounded-xl p-4 border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="caption" style={{ color: 'var(--text-secondary)' }}>? ???</div>
            <div
              className="body-lg font-bold tabular-nums mt-1"
              style={{ color: (irrData?.irr ?? p.total_return_rate) >= 0 ? 'var(--upbit-positive)' : 'var(--upbit-ask)' }}
            >
              {formatRate(irrData?.irr ?? p.total_return_rate)}
            </div>
          </div>
        </div>

        {perf.monthly_dividends.length > 0 && (
          <div className="rounded-xl p-4 border mb-6" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="body-sm font-semibold mb-4">?? ??</div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={perf.monthly_dividends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 10000).toFixed(0)}?`} />
                  <Tooltip formatter={(v: number | undefined) => [formatKrw(v ?? 0), '??']} />
                  <Bar dataKey="amount" fill="var(--upbit-bid)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="body-sm font-semibold">??? ??</div>
          {p.positions.length === 0 ? (
            <div
              className="rounded-xl p-8 text-center body-sm"
              style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', border: '1px solid' }}
            >
              ?? ??? ????.
              <br />
              <Link href="/market" className="font-semibold mt-2 inline-block" style={{ color: 'var(--upbit-bid)' }}>
                ???? ????
              </Link>
            </div>
          ) : (
            [...p.positions].sort((a, b) => (b.unrealized_rate ?? 0) - (a.unrealized_rate ?? 0)).map((pos) => (
              <Link
                key={pos.asset_id}
                href={`/market/${pos.asset_id}`}
                className="block rounded-xl p-4 border tap-scale"
                style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold body-sm" style={{ color: 'var(--text)' }}>
                      {pos.title}
                    </div>
                    <div className="caption mt-1" style={{ color: 'var(--text-secondary)' }}>
                      {pos.quantity}? ? ?? {formatKrw(pos.avg_price)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold tabular-nums" style={{ color: 'var(--text)' }}>
                      {formatKrw(pos.current_value)}
                    </div>
                    <div
                      className="caption tabular-nums"
                      style={{ color: pos.unrealized_rate >= 0 ? 'var(--upbit-positive)' : 'var(--upbit-ask)' }}
                    >
                      {formatRate(pos.unrealized_rate)}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

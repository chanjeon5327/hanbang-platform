/**
 * ============================================================================
 * RiskCard — 리스크 지표 카드 (MDD + Rolling 30/90 + Equity Mini Chart)
 * ============================================================================
 *
 * /api/dashboard/risk 데이터를 받아 표시합니다.
 * - MDD (최대 낙폭)
 * - Rolling 30일/90일 수익률
 * - Equity 미니 차트 (sparkline, recharts)
 *
 * ============================================================================
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { ShieldAlert, RefreshCw, AlertCircle } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { formatRate } from '@/lib/utils/format';
import Skeleton from '@/components/ui/Skeleton';

import type { RiskResponse } from '@/lib/types/financial';

export default function RiskCard() {
  const [data, setData] = useState<RiskResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch('/api/dashboard/risk', { cache: 'no-store' });
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="rounded-2xl border p-5 space-y-3" style={{ backgroundColor: 'var(--card-bg, #fff)', borderColor: 'var(--border-color, #e5e7eb)' }}>
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div
        className="rounded-2xl border p-5 flex flex-col items-center justify-center gap-2"
        style={{ backgroundColor: 'var(--card-bg, #fff)', borderColor: 'var(--border-color, #e5e7eb)' }}
      >
        <AlertCircle size={24} className="text-gray-400" />
        <p className="text-sm text-gray-500">리스크 데이터를 불러오지 못했습니다</p>
        <button
          onClick={fetchData}
          className="text-sm font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition"
          style={{ color: 'var(--accent-color, #3b82f6)' }}
        >
          <RefreshCw size={14} /> 다시 시도
        </button>
      </div>
    );
  }

  const mddPct = data.mdd?.mdd_pct ?? 0;
  const mddColor = mddPct < -20 ? '#dc2626' : mddPct < -10 ? '#f59e0b' : '#16a34a';
  const r30 = data.rolling_returns.return_30d;
  const r90 = data.rolling_returns.return_90d;

  const chartColor = (data.equity_history.length >= 2 &&
    data.equity_history[data.equity_history.length - 1].equity >= data.equity_history[0].equity)
    ? '#16a34a' : '#dc2626';

  return (
    <div
      className="rounded-2xl border p-5"
      style={{ backgroundColor: 'var(--card-bg, #fff)', borderColor: 'var(--border-color, #e5e7eb)' }}
    >
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-3">
        <ShieldAlert size={16} style={{ color: mddColor }} />
        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary, #6b7280)' }}>
          리스크 지표
        </span>
      </div>

      {/* MDD + Rolling */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <div className="text-xs" style={{ color: 'var(--text-muted, #9ca3af)' }}>MDD</div>
          <div className="text-lg font-bold tabular-nums" style={{ color: mddColor }}>
            {mddPct !== 0 ? `${mddPct.toFixed(1)}%` : '—'}
          </div>
        </div>
        <div>
          <div className="text-xs" style={{ color: 'var(--text-muted, #9ca3af)' }}>30일</div>
          <div
            className="text-lg font-bold tabular-nums"
            style={{ color: (r30 ?? 0) >= 0 ? 'var(--upbit-positive, #16a34a)' : 'var(--upbit-ask, #dc2626)' }}
          >
            {r30 != null ? formatRate(r30) : '—'}
          </div>
        </div>
        <div>
          <div className="text-xs" style={{ color: 'var(--text-muted, #9ca3af)' }}>90일</div>
          <div
            className="text-lg font-bold tabular-nums"
            style={{ color: (r90 ?? 0) >= 0 ? 'var(--upbit-positive, #16a34a)' : 'var(--upbit-ask, #dc2626)' }}
          >
            {r90 != null ? formatRate(r90) : '—'}
          </div>
        </div>
      </div>

      {/* Equity Mini Chart */}
      {data.equity_history.length > 1 ? (
        <div className="h-20">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.equity_history} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartColor} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" hide />
              <Tooltip
                contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid #e5e7eb' }}
                formatter={(v: number | undefined) => [`₩${(v ?? 0).toLocaleString()}`, '자산']}
                labelFormatter={(l: unknown) => String(l ?? '')}
              />
              <Area
                type="monotone"
                dataKey="equity"
                stroke={chartColor}
                strokeWidth={1.5}
                fill="url(#eqGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-20 flex items-center justify-center text-xs" style={{ color: 'var(--text-muted, #9ca3af)' }}>
          일별 스냅샷 데이터가 부족합니다
        </div>
      )}

      {/* MDD 상세 */}
      {data.mdd && (
        <div className="mt-2 text-xs" style={{ color: 'var(--text-muted, #9ca3af)' }}>
          고점 {data.mdd.peak_date} → 저점 {data.mdd.trough_date}
        </div>
      )}
    </div>
  );
}

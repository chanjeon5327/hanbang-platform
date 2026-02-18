/**
 * ============================================================================
 * PnLCard — 손익 요약 카드 (Toss 정적 + Upbit 정보 밀도)
 * ============================================================================
 *
 * /api/dashboard/pnl 데이터를 받아 표시합니다.
 * - 총 포트폴리오 가치, 미실현/실현 손익
 * - 포지션별 미니 리스트 (최대 5개)
 * - 로딩 스켈레톤 + 에러 재시도
 *
 * ============================================================================
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, AlertCircle } from 'lucide-react';
import { formatKrw, formatRate } from '@/lib/utils/format';
import Skeleton from '@/components/ui/Skeleton';

import type { PnlResponse } from '@/lib/types/financial';

export default function PnLCard() {
  const [data, setData] = useState<PnlResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch('/api/dashboard/pnl', { cache: 'no-store' });
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
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-32" />
        <div className="space-y-2 pt-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
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
        <p className="text-sm text-gray-500">손익 데이터를 불러오지 못했습니다</p>
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

  const isPositive = data.total_unrealized_pnl >= 0;
  const pnlColor = isPositive ? 'var(--upbit-positive, #16a34a)' : 'var(--upbit-ask, #dc2626)';

  return (
    <div
      className="rounded-2xl border p-5"
      style={{ backgroundColor: 'var(--card-bg, #fff)', borderColor: 'var(--border-color, #e5e7eb)' }}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary, #6b7280)' }}>
          내 포트폴리오
        </span>
        {isPositive ? <TrendingUp size={16} style={{ color: pnlColor }} /> : <TrendingDown size={16} style={{ color: pnlColor }} />}
      </div>

      {/* 총 가치 */}
      <div className="text-2xl font-bold tabular-nums" style={{ color: 'var(--text-primary, #111)' }}>
        {formatKrw(data.total_portfolio_value)}
      </div>

      {/* 미실현/실현 손익 */}
      <div className="flex items-center gap-3 mt-1 text-sm">
        <span style={{ color: pnlColor }}>
          미실현 {data.total_unrealized_pnl >= 0 ? '+' : ''}{formatKrw(data.total_unrealized_pnl)}
        </span>
        <span style={{ color: 'var(--text-secondary, #6b7280)' }}>
          실현 {formatKrw(data.total_realized_pnl)}
        </span>
      </div>

      {/* 현금 잔고 */}
      <div className="mt-1 text-xs" style={{ color: 'var(--text-muted, #9ca3af)' }}>
        현금 {formatKrw(data.cash_balance)}
      </div>

      {/* 포지션 리스트 */}
      {data.positions.length > 0 && (
        <div className="mt-4 space-y-2">
          {data.positions.slice(0, 5).map((pos) => {
            const posColor = pos.unrealized_pnl >= 0
              ? 'var(--upbit-positive, #16a34a)'
              : 'var(--upbit-ask, #dc2626)';
            return (
              <div
                key={pos.asset_id}
                className="flex items-center justify-between py-2 px-3 rounded-xl"
                style={{ backgroundColor: 'var(--bg-secondary, #f9fafb)' }}
              >
                <div>
                  <div className="text-sm font-medium" style={{ color: 'var(--text-primary, #111)' }}>
                    {pos.title}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary, #6b7280)' }}>
                    {pos.quantity}주 · 평균 {formatKrw(pos.avg_price)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold tabular-nums" style={{ color: posColor }}>
                    {pos.unrealized_pnl >= 0 ? '+' : ''}{formatKrw(pos.unrealized_pnl)}
                  </div>
                  <div className="text-xs tabular-nums" style={{ color: posColor }}>
                    {formatRate(pos.unrealized_rate)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

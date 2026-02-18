/**
 * ============================================================================
 * DividendCard — 배당 요약 카드 (이번달/누적 + 최근 분배 + 월별 바차트)
 * ============================================================================
 *
 * /api/dashboard/dividends 데이터를 받아 표시합니다.
 * - 이번 달 배당, 누적 배당
 * - 최근 12개월 월별 배당 바차트
 * - 최근 분배 5건 리스트
 *
 * ============================================================================
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { Banknote, RefreshCw, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { formatKrw } from '@/lib/utils/format';
import Skeleton from '@/components/ui/Skeleton';

import type { DividendDashboardResponse } from '@/lib/types/financial';

export default function DividendCard() {
  const [data, setData] = useState<DividendDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch('/api/dashboard/dividends', { cache: 'no-store' });
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
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-20 w-full" />
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
        <p className="text-sm text-gray-500">배당 데이터를 불러오지 못했습니다</p>
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

  const chartData = data.monthly.map((m) => ({
    month: m.month.slice(5),
    금액: m.amount,
  }));

  return (
    <div
      className="rounded-2xl border p-5"
      style={{ backgroundColor: 'var(--card-bg, #fff)', borderColor: 'var(--border-color, #e5e7eb)' }}
    >
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-1">
        <Banknote size={16} style={{ color: 'var(--upbit-positive, #16a34a)' }} />
        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary, #6b7280)' }}>
          수익분배
        </span>
      </div>

      {/* 이번 달 + 누적 */}
      <div className="flex items-end gap-4 mb-4">
        <div>
          <div className="text-xs" style={{ color: 'var(--text-muted, #9ca3af)' }}>이번 달</div>
          <div className="text-2xl font-bold tabular-nums" style={{ color: 'var(--upbit-positive, #16a34a)' }}>
            {formatKrw(data.this_month)}
          </div>
        </div>
        <div>
          <div className="text-xs" style={{ color: 'var(--text-muted, #9ca3af)' }}>누적</div>
          <div className="text-lg font-semibold tabular-nums" style={{ color: 'var(--text-primary, #111)' }}>
            {formatKrw(data.total_cumulative)}
          </div>
        </div>
      </div>

      {/* 월별 바차트 */}
      {chartData.some((d) => d.금액 > 0) ? (
        <div className="h-16 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <XAxis dataKey="month" hide />
              <Tooltip
                contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid #e5e7eb' }}
                formatter={(v: number | undefined) => [formatKrw(v ?? 0), '배당']}
              />
              <Bar dataKey="금액" fill="var(--upbit-bid, #3b82f6)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-16 flex items-center justify-center text-xs mb-4" style={{ color: 'var(--text-muted, #9ca3af)' }}>
          아직 배당 내역이 없습니다
        </div>
      )}

      {/* 최근 분배 내역 */}
      {data.recent_distributions.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-xs font-medium" style={{ color: 'var(--text-secondary, #6b7280)' }}>
            최근 분배
          </div>
          {data.recent_distributions.slice(0, 5).map((d, i) => (
            <div
              key={i}
              className="flex justify-between items-center text-xs py-1.5 px-2 rounded-lg"
              style={{ backgroundColor: 'var(--bg-secondary, #f9fafb)' }}
            >
              <span style={{ color: 'var(--text-secondary, #6b7280)' }}>
                {new Date(d.created_at).toLocaleDateString('ko-KR')}
              </span>
              <span className="font-medium tabular-nums" style={{ color: 'var(--upbit-positive, #16a34a)' }}>
                +{formatKrw(d.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

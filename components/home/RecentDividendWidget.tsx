'use client';

import { useEffect, useState } from 'react';
import { formatKrw } from '@/lib/utils/format';

type Item = { id: string; amount: number; item_id: string | null; created_at: string };

export default function RecentDividendWidget() {
  const [data, setData] = useState<{ recent_dividends: Item[]; total_dividend_paid: number } | null>(null);

  useEffect(() => {
    fetch('/api/dividend/recent-public', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) return null;

  const { recent_dividends, total_dividend_paid } = data;

  return (
    <div
      className="rounded-[16px] p-4 border"
      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
    >
      <div className="flex justify-between items-center mb-3">
        <span className="body-sm font-semibold" style={{ color: 'var(--text)' }}>
          실시간 배당 발생
        </span>
        <span className="caption font-bold tabular-nums" style={{ color: 'var(--upbit-positive)' }}>
          누적 {formatKrw(total_dividend_paid)} 지급
        </span>
      </div>
      <div className="space-y-2">
        {recent_dividends.length === 0 ? (
          <p className="caption" style={{ color: 'var(--text-secondary)' }}>
            아직 배당 지급 내역이 없습니다.
          </p>
        ) : (
          recent_dividends.map((d) => (
            <div
              key={d.id}
              className="flex justify-between caption py-1"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <span className="tabular-nums font-semibold" style={{ color: 'var(--upbit-positive)' }}>
                {formatKrw(d.amount)} 배당 지급
              </span>
              <span className="caption" style={{ color: 'var(--text-secondary)' }}>
                {new Date(d.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

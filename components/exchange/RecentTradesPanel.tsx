/**
 * RecentTradesPanel — 최근 체결 내역
 */
'use client';

import { useEffect, useState, useCallback } from 'react';
import { formatKrw } from '@/lib/utils/format';
import type { TradePublic } from '@/lib/types/financial';

export default function RecentTradesPanel({ assetId }: { assetId: string }) {
  const [trades, setTrades] = useState<TradePublic[]>([]);

  const fetch_ = useCallback(async () => {
    try {
      const res = await fetch(`/api/exchange/trades/${assetId}`, { cache: 'no-store' });
      if (!res.ok) return;
      const d = await res.json();
      setTrades(d.trades ?? []);
    } catch { /* ignore */ }
  }, [assetId]);

  useEffect(() => { fetch_(); const t = setInterval(fetch_, 5000); return () => clearInterval(t); }, [fetch_]);

  return (
    <div className="rounded-2xl border p-4" style={{ backgroundColor: 'var(--card-bg, #fff)', borderColor: 'var(--border-color, #e5e7eb)' }}>
      <div className="text-xs font-semibold mb-3" style={{ color: 'var(--text-primary, #111)' }}>최근 체결</div>
      <div className="space-y-1 max-h-64 overflow-y-auto">
        {trades.length === 0 && (
          <div className="text-center py-4 text-xs" style={{ color: 'var(--text-muted, #9ca3af)' }}>체결 내역이 없습니다</div>
        )}
        {trades.slice(0, 30).map((t) => (
          <div key={t.id} className="flex justify-between text-xs py-0.5">
            <span className="tabular-nums font-medium"
              style={{ color: t.taker_side === 'BUY' ? 'var(--upbit-positive, #16a34a)' : 'var(--upbit-ask, #dc2626)' }}>
              {formatKrw(t.price)}
            </span>
            <span className="tabular-nums" style={{ color: 'var(--text-secondary, #6b7280)' }}>
              {Number(t.quantity).toFixed(2)}
            </span>
            <span className="tabular-nums" style={{ color: 'var(--text-muted, #9ca3af)' }}>
              {new Date(t.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * RecentTradesPanel — 최근 체결 내역
 * HANBANG Design V1: 통일된 카드/토큰
 */
'use client';

import { useEffect, useState, useCallback } from 'react';
import { formatKrw } from '@/lib/utils/format';
import type { TradePublic } from '@/lib/types/financial';

export default function RecentTradesPanel({ assetId }: { assetId: string }) {
  const [trades, setTrades] = useState<TradePublic[]>([]);

  const fetch_ = useCallback(async () => {
    // TODO: experimental — exchange API is admin-only. Uncomment for internal testing.
    // try {
    //   const res = await fetch(`/api/exchange/trades/${assetId}`, { cache: 'no-store' });
    //   if (!res.ok) return;
    //   const d = await res.json();
    //   setTrades(d.trades ?? []);
    // } catch { /* ignore */ }
  }, [assetId]);

  useEffect(() => { fetch_(); const t = setInterval(fetch_, 5000); return () => clearInterval(t); }, [fetch_]);

  return (
    <div className="rounded-[var(--radius-base)] border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-sm)', padding: 'var(--space-md)' }}>
      <div className="caption font-semibold mb-3" style={{ color: 'var(--text)' }}>최근 체결</div>
      <div className="space-y-1 max-h-64 overflow-y-auto">
        {trades.length === 0 && (
          <div className="hb-empty caption py-4">체결 내역이 없습니다</div>
        )}
        {trades.slice(0, 30).map((t) => (
          <div key={t.id} className="flex justify-between caption py-0.5">
            <span className="metric-number font-medium"
              style={{ color: t.taker_side === 'BUY' ? 'var(--emerald)' : 'var(--accent-loss)' }}>
              {formatKrw(t.price)}
            </span>
            <span className="metric-number" style={{ color: 'var(--text-secondary)' }}>
              {Number(t.quantity).toFixed(2)}
            </span>
            <span className="metric-number" style={{ color: 'var(--text-muted)' }}>
              {new Date(t.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

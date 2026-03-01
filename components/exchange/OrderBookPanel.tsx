/**
 * OrderBookPanel — Upbit형 오더북 (매수/매도 호가)
 * HANBANG Design V1: 통일된 카드/토큰
 */
'use client';

import { useEffect, useState, useCallback } from 'react';
import { formatKrw } from '@/lib/utils/format';
import type { OrderBookLevel } from '@/lib/types/financial';

export default function OrderBookPanel({ assetId }: { assetId: string }) {
  const [bids, setBids] = useState<OrderBookLevel[]>([]);
  const [asks, setAsks] = useState<OrderBookLevel[]>([]);

  const fetch_ = useCallback(async () => {
    // TODO: experimental — exchange API is admin-only. Uncomment for internal testing.
    // try {
    //   const res = await fetch(`/api/exchange/orderbook/${assetId}`, { cache: 'no-store' });
    //   if (!res.ok) return;
    //   const d = await res.json();
    //   setBids(d.bids ?? []);
    //   setAsks(d.asks ?? []);
    // } catch { /* ignore */ }
  }, [assetId]);

  useEffect(() => { fetch_(); const t = setInterval(fetch_, 3000); return () => clearInterval(t); }, [fetch_]);

  const maxQty = Math.max(...bids.map(b => b.qty), ...asks.map(a => a.qty), 1);

  return (
    <div className="rounded-[var(--radius-base)] border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-sm)', padding: 'var(--space-md)' }}>
      <div className="caption font-semibold mb-3" style={{ color: 'var(--text)' }}>오더북</div>

      <div className="space-y-0.5 mb-2">
        {asks.slice(0, 10).reverse().map((a, i) => (
          <HogaRow key={`a${i}`} price={a.price} qty={a.qty} maxQty={maxQty} side="SELL" />
        ))}
      </div>

      {bids.length > 0 && asks.length > 0 && (
        <div className="text-center caption py-1 font-medium" style={{ color: 'var(--text-muted)' }}>
          스프레드 {formatKrw(asks[0].price - bids[0].price)}
        </div>
      )}

      <div className="space-y-0.5 mt-2">
        {bids.slice(0, 10).map((b, i) => (
          <HogaRow key={`b${i}`} price={b.price} qty={b.qty} maxQty={maxQty} side="BUY" />
        ))}
      </div>

      {bids.length === 0 && asks.length === 0 && (
        <div className="hb-empty caption py-6">호가가 없습니다</div>
      )}
    </div>
  );
}

function HogaRow({ price, qty, maxQty, side }: { price: number; qty: number; maxQty: number; side: 'BUY' | 'SELL' }) {
  const pct = (qty / maxQty) * 100;
  const isBuy = side === 'BUY';
  const bg = isBuy ? 'rgba(5,150,105,0.06)' : 'rgba(220,38,38,0.06)';
  const barBg = isBuy ? 'rgba(5,150,105,0.12)' : 'rgba(220,38,38,0.12)';
  const color = isBuy ? 'var(--emerald)' : 'var(--accent-loss)';

  return (
    <div className="relative flex justify-between items-center caption px-2 py-1 rounded-md" style={{ backgroundColor: bg }}>
      <div
        className="absolute top-0 bottom-0 rounded-md"
        style={{
          [isBuy ? 'left' : 'right']: 0,
          width: `${Math.min(pct, 100)}%`,
          backgroundColor: barBg,
        }}
      />
      <span className="relative font-medium metric-number" style={{ color }}>{formatKrw(price)}</span>
      <span className="relative metric-number" style={{ color: 'var(--text-secondary)' }}>{qty.toFixed(2)}</span>
    </div>
  );
}

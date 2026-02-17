/**
 * OrderBookPanel — Upbit형 오더북 (매수/매도 호가)
 */
'use client';

import { useEffect, useState, useCallback } from 'react';
import { formatKrw } from '@/lib/utils/format';
import type { OrderBookLevel } from '@/lib/types/financial';

export default function OrderBookPanel({ assetId }: { assetId: string }) {
  const [bids, setBids] = useState<OrderBookLevel[]>([]);
  const [asks, setAsks] = useState<OrderBookLevel[]>([]);

  const fetch_ = useCallback(async () => {
    try {
      const res = await fetch(`/api/exchange/orderbook/${assetId}`, { cache: 'no-store' });
      if (!res.ok) return;
      const d = await res.json();
      setBids(d.bids ?? []);
      setAsks(d.asks ?? []);
    } catch { /* ignore */ }
  }, [assetId]);

  useEffect(() => { fetch_(); const t = setInterval(fetch_, 3000); return () => clearInterval(t); }, [fetch_]);

  const maxQty = Math.max(...bids.map(b => b.qty), ...asks.map(a => a.qty), 1);

  return (
    <div className="rounded-2xl border p-4" style={{ backgroundColor: 'var(--card-bg, #fff)', borderColor: 'var(--border-color, #e5e7eb)' }}>
      <div className="text-xs font-semibold mb-3" style={{ color: 'var(--text-primary, #111)' }}>오더북</div>

      {/* 매도 호가 (역순: 가장 낮은 가격이 아래) */}
      <div className="space-y-0.5 mb-2">
        {asks.slice(0, 10).reverse().map((a, i) => (
          <HogaRow key={`a${i}`} price={a.price} qty={a.qty} maxQty={maxQty} side="SELL" />
        ))}
      </div>

      {/* 스프레드 */}
      {bids.length > 0 && asks.length > 0 && (
        <div className="text-center text-xs py-1 font-medium" style={{ color: 'var(--text-muted, #9ca3af)' }}>
          스프레드 {formatKrw(asks[0].price - bids[0].price)}
        </div>
      )}

      {/* 매수 호가 */}
      <div className="space-y-0.5 mt-2">
        {bids.slice(0, 10).map((b, i) => (
          <HogaRow key={`b${i}`} price={b.price} qty={b.qty} maxQty={maxQty} side="BUY" />
        ))}
      </div>

      {bids.length === 0 && asks.length === 0 && (
        <div className="text-center py-6 text-xs" style={{ color: 'var(--text-muted, #9ca3af)' }}>
          호가가 없습니다
        </div>
      )}
    </div>
  );
}

function HogaRow({ price, qty, maxQty, side }: { price: number; qty: number; maxQty: number; side: 'BUY' | 'SELL' }) {
  const pct = (qty / maxQty) * 100;
  const isBuy = side === 'BUY';
  const bg = isBuy ? 'rgba(22,163,74,0.08)' : 'rgba(220,38,38,0.08)';
  const color = isBuy ? 'var(--upbit-positive, #16a34a)' : 'var(--upbit-ask, #dc2626)';

  return (
    <div className="relative flex justify-between items-center text-xs px-2 py-1 rounded" style={{ backgroundColor: bg }}>
      <div
        className="absolute top-0 bottom-0 rounded"
        style={{
          [isBuy ? 'left' : 'right']: 0,
          width: `${Math.min(pct, 100)}%`,
          backgroundColor: isBuy ? 'rgba(22,163,74,0.12)' : 'rgba(220,38,38,0.12)',
        }}
      />
      <span className="relative font-medium tabular-nums" style={{ color }}>{formatKrw(price)}</span>
      <span className="relative tabular-nums" style={{ color: 'var(--text-secondary, #6b7280)' }}>{qty.toFixed(2)}</span>
    </div>
  );
}

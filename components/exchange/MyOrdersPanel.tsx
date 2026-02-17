/**
 * MyOrdersPanel — 내 주문 (미체결 + 취소 버튼)
 */
'use client';

import { useEffect, useState, useCallback } from 'react';
import { formatKrw } from '@/lib/utils/format';
import type { ExchangeOrder } from '@/lib/types/financial';

export default function MyOrdersPanel({ assetId }: { assetId: string }) {
  const [orders, setOrders] = useState<ExchangeOrder[]>([]);
  const [canceling, setCanceling] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`/api/exchange/my-orders?asset_id=${assetId}`, { cache: 'no-store' });
      if (!res.ok) return;
      const d = await res.json();
      setOrders(d.orders ?? []);
    } catch { /* ignore */ }
  }, [assetId]);

  useEffect(() => { fetchOrders(); const t = setInterval(fetchOrders, 5000); return () => clearInterval(t); }, [fetchOrders]);

  const cancel = useCallback(async (orderId: string) => {
    setCanceling(orderId);
    try {
      await fetch('/api/exchange/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId }),
      });
      await fetchOrders();
    } catch { /* ignore */ }
    setCanceling(null);
  }, [fetchOrders]);

  const openOrders = orders.filter(o => o.status === 'OPEN' || o.status === 'PARTIALLY_FILLED');

  return (
    <div className="rounded-2xl border p-4" style={{ backgroundColor: 'var(--card-bg, #fff)', borderColor: 'var(--border-color, #e5e7eb)' }}>
      <div className="text-xs font-semibold mb-3" style={{ color: 'var(--text-primary, #111)' }}>
        내 주문 ({openOrders.length})
      </div>
      {openOrders.length === 0 ? (
        <div className="text-center py-4 text-xs" style={{ color: 'var(--text-muted, #9ca3af)' }}>미체결 주문이 없습니다</div>
      ) : (
        <div className="space-y-2">
          {openOrders.map((o) => {
            const isBuy = o.side === 'BUY';
            return (
              <div key={o.id} className="flex items-center justify-between py-2 px-3 rounded-xl text-xs"
                style={{ backgroundColor: 'var(--bg-secondary, #f9fafb)' }}>
                <div>
                  <span className="font-semibold" style={{ color: isBuy ? '#16a34a' : '#dc2626' }}>
                    {isBuy ? '매수' : '매도'}
                  </span>
                  <span className="ml-2 tabular-nums" style={{ color: 'var(--text-primary, #111)' }}>
                    {o.price ? formatKrw(o.price) : '시장가'}
                  </span>
                  <span className="ml-2" style={{ color: 'var(--text-secondary, #6b7280)' }}>
                    잔량 {Number(o.remaining_qty).toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={() => cancel(o.id)}
                  disabled={canceling === o.id}
                  className="px-2 py-1 rounded text-xs font-medium transition hover:bg-red-100"
                  style={{ color: '#dc2626' }}
                >
                  {canceling === o.id ? '...' : '취소'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * MyOrdersPanel — 내 주문 (미체결 + 취소 버튼)
 * HANBANG Design V1: 통일된 카드/토큰
 */
'use client';

import { useEffect, useState, useCallback } from 'react';
import { formatKrw } from '@/lib/utils/format';
import type { ExchangeOrder } from '@/lib/types/financial';

export default function MyOrdersPanel({ assetId }: { assetId: string }) {
  const [orders, setOrders] = useState<ExchangeOrder[]>([]);
  const [canceling, setCanceling] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    // TODO: experimental — exchange API is admin-only. Uncomment for internal testing.
    // try {
    //   const res = await fetch(`/api/exchange/my-orders?asset_id=${assetId}`, { cache: 'no-store' });
    //   if (!res.ok) return;
    //   const d = await res.json();
    //   setOrders(d.orders ?? []);
    // } catch { /* ignore */ }
  }, [assetId]);

  useEffect(() => { fetchOrders(); const t = setInterval(fetchOrders, 5000); return () => clearInterval(t); }, [fetchOrders]);

  const cancel = useCallback(async (orderId: string) => {
    // TODO: experimental — exchange API is admin-only. Uncomment for internal testing.
    setCanceling(orderId);
    // try {
    //   await fetch('/api/exchange/cancel', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ order_id: orderId }),
    //   });
    //   await fetchOrders();
    // } catch { /* ignore */ }
    setCanceling(null);
  }, [fetchOrders]);

  const openOrders = orders.filter(o => o.status === 'OPEN' || o.status === 'PARTIALLY_FILLED');

  return (
    <div className="rounded-[var(--radius-base)] border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-sm)', padding: 'var(--space-md)' }}>
      <div className="caption font-semibold mb-3" style={{ color: 'var(--text)' }}>
        내 주문 ({openOrders.length})
      </div>
      {openOrders.length === 0 ? (
        <div className="hb-empty caption py-4">미체결 주문이 없습니다</div>
      ) : (
        <div className="space-y-2">
          {openOrders.map((o) => {
            const isBuy = o.side === 'BUY';
            return (
              <div key={o.id} className="flex items-center justify-between py-2 px-3 rounded-xl caption"
                style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div>
                  <span className="font-semibold" style={{ color: isBuy ? 'var(--emerald)' : 'var(--accent-loss)' }}>
                    {isBuy ? '매수' : '매도'}
                  </span>
                  <span className="ml-2 metric-number" style={{ color: 'var(--text)' }}>
                    {o.price ? formatKrw(o.price) : '시장가'}
                  </span>
                  <span className="ml-2" style={{ color: 'var(--text-secondary)' }}>
                    잔량 {Number(o.remaining_qty).toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={() => cancel(o.id)}
                  disabled={canceling === o.id}
                  className="px-2 py-1 rounded-lg caption font-medium transition hover:opacity-80"
                  style={{ color: 'var(--accent-loss)', backgroundColor: 'rgba(220,38,38,0.06)' }}
                >
                  {canceling === o.id ? (
                    <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : '취소'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

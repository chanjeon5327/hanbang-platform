'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { formatQty } from '@/lib/utils/format';

type OrderbookRow = { price_usd: number; quantity: number };

function formatUsd(n: number): string {
  return `$${n.toFixed(2)}`;
}

type Props = {
  contentId: string;
  currentPriceUsd?: number | null;
  /** 내 주문이 있는 가격(USD) 목록 - 해당 호가 행 배경 강조 */
  myOrderPrices?: number[];
  /** true면 거래 불가, empty state 메시지 표시 */
  disabled?: boolean;
};

export default function OrderBookRealtime({ contentId, currentPriceUsd, myOrderPrices = [], disabled }: Props) {
  const [bids, setBids] = useState<OrderbookRow[]>([]);
  const [asks, setAsks] = useState<OrderbookRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrderbook = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/book?item_id=${contentId}`, { cache: 'no-store' });
      const j = await res.json();
      const rawBids = (j.bids ?? []).map((b: { price_usd: number; quantity: number }) => ({ ...b }));
      const rawAsks = (j.asks ?? []).map((a: { price_usd: number; quantity: number }) => ({ ...a }));
      setBids(rawBids);
      setAsks(rawAsks);
    } catch {
      setBids([]);
      setAsks([]);
    } finally {
      setLoading(false);
    }
  }, [contentId]);

  useEffect(() => {
    fetchOrderbook();
  }, [fetchOrderbook]);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase?.channel) return;

    const channel = supabase
      .channel(`orderbook:${contentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orderbook_orders',
          filter: `content_id=eq.${contentId}`,
        },
        () => {
          fetchOrderbook();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [contentId, fetchOrderbook]);

  const { bidRows, askRows } = useMemo(() => {
    const bidSorted = [...bids].sort((a, b) => b.price_usd - a.price_usd).slice(0, 15);
    const askSorted = [...asks].sort((a, b) => a.price_usd - b.price_usd).slice(0, 15);
    return { bidRows: bidSorted, askRows: askSorted };
  }, [bids, asks]);

  const maxBidQty = bidRows.length > 0 ? Math.max(...bidRows.map((b) => b.quantity)) : 1;
  const maxAskQty = askRows.length > 0 ? Math.max(...askRows.map((a) => a.quantity)) : 1;
  const bestBid = bidRows[0]?.price_usd;
  const bestAsk = askRows[0]?.price_usd;

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 py-4">
        <div className="animate-pulse h-48 rounded-lg" style={{ backgroundColor: 'var(--border)' }} />
        <div className="animate-pulse h-48 rounded-lg" style={{ backgroundColor: 'var(--border)' }} />
      </div>
    );
  }

  if (disabled) {
    return (
      <div className="py-6 text-center">
        <p className="caption" style={{ color: 'var(--text-secondary)' }}>
          현재는 거래가 준비 중이에요. 배당 정보만 확인할 수 있어요.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <div className="caption mb-1 font-medium" style={{ color: 'var(--text-secondary)' }}>
          매수 호가
        </div>
        <div className="space-y-0.5">
          {bidRows.map((b, i) => {
            const isCurrentPrice = currentPriceUsd != null && Math.abs(b.price_usd - currentPriceUsd) < 0.01;
            const isMyOrder = myOrderPrices.some((p) => Math.abs(p - b.price_usd) < 0.01);
            return (
              <div
                key={`bid-${i}-${b.price_usd}`}
                className="flex justify-between items-center body-sm relative py-1 px-2 rounded transition-colors"
                style={{
                  backgroundColor: isMyOrder
                    ? 'rgba(5,150,105,0.15)'
                    : isCurrentPrice
                      ? 'rgba(5,150,105,0.08)'
                      : undefined,
                }}
              >
                <div
                  className="absolute left-0 top-0 bottom-0 rounded-r"
                  style={{
                    width: `${Math.min(100, (b.quantity / maxBidQty) * 100)}%`,
                    background: 'linear-gradient(90deg, rgba(5,150,105,0.2) 0%, rgba(5,150,105,0.05) 100%)',
                  }}
                />
                <span
                  className="font-semibold metric-number relative z-10"
                  style={{ color: 'var(--emerald)' }}
                >
                  {formatUsd(b.price_usd)}
                </span>
                <span className="metric-number relative z-10" style={{ color: 'var(--text-secondary)' }}>
                  {formatQty(b.quantity)}
                </span>
              </div>
            );
          })}
          {bidRows.length === 0 && (
            <p className="caption py-4 text-center" style={{ color: 'var(--text-secondary)' }}>
              매수 호가 없음
            </p>
          )}
        </div>
      </div>
      <div>
        <div className="caption mb-1 font-medium" style={{ color: 'var(--text-secondary)' }}>
          매도 호가
        </div>
        <div className="space-y-0.5">
          {askRows.map((a, i) => {
            const isCurrentPrice = currentPriceUsd != null && Math.abs(a.price_usd - currentPriceUsd) < 0.01;
            const isMyOrder = myOrderPrices.some((p) => Math.abs(p - a.price_usd) < 0.01);
            return (
              <div
                key={`ask-${i}-${a.price_usd}`}
                className="flex justify-between items-center body-sm relative py-1 px-2 rounded transition-colors"
                style={{
                  backgroundColor: isMyOrder
                    ? 'rgba(220,38,38,0.15)'
                    : isCurrentPrice
                      ? 'rgba(220,38,38,0.08)'
                      : undefined,
                }}
              >
                <div
                  className="absolute right-0 top-0 bottom-0 rounded-l"
                  style={{
                    width: `${Math.min(100, (a.quantity / maxAskQty) * 100)}%`,
                    background: 'linear-gradient(270deg, rgba(220,38,38,0.2) 0%, rgba(220,38,38,0.05) 100%)',
                    right: 0,
                    left: 'auto',
                  }}
                />
                <span
                  className="font-semibold metric-number relative z-10"
                  style={{ color: 'var(--accent-loss)' }}
                >
                  {formatUsd(a.price_usd)}
                </span>
                <span className="metric-number relative z-10" style={{ color: 'var(--text-secondary)' }}>
                  {formatQty(a.quantity)}
                </span>
              </div>
            );
          })}
          {askRows.length === 0 && (
            <p className="caption py-4 text-center" style={{ color: 'var(--text-secondary)' }}>
              매도 호가 없음
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

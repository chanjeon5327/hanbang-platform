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
};

export default function OrderBookRealtime({ contentId, currentPriceUsd, myOrderPrices = [] }: Props) {
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
        <div className="animate-pulse h-48 rounded-lg bg-[var(--upbit-bg)]" />
        <div className="animate-pulse h-48 rounded-lg bg-[var(--upbit-bg)]" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <div className="text-[11px] mb-1 font-medium" style={{ color: 'var(--upbit-text-dim)' }}>
          매수 호가
        </div>
        <div className="space-y-0.5">
          {bidRows.map((b, i) => {
            const isCurrentPrice = currentPriceUsd != null && Math.abs(b.price_usd - currentPriceUsd) < 0.01;
            const isMyOrder = myOrderPrices.some((p) => Math.abs(p - b.price_usd) < 0.01);
            return (
              <div
                key={`bid-${i}-${b.price_usd}`}
                className="flex justify-between items-center text-[13px] relative py-1 px-2 rounded transition-colors"
                style={{
                  backgroundColor: isMyOrder
                    ? 'rgba(30,136,229,0.2)'
                    : isCurrentPrice
                      ? 'rgba(30,136,229,0.12)'
                      : undefined,
                }}
              >
                <div
                  className="absolute left-0 top-0 bottom-0 rounded-r"
                  style={{
                    width: `${Math.min(100, (b.quantity / maxBidQty) * 100)}%`,
                    background: 'linear-gradient(90deg, rgba(30,136,229,0.35) 0%, rgba(30,136,229,0.08) 100%)',
                  }}
                />
                <span
                  className="font-semibold tabular-nums relative z-10"
                  style={{ color: isCurrentPrice ? 'var(--upbit-bid)' : 'var(--upbit-bid)' }}
                >
                  {formatUsd(b.price_usd)}
                </span>
                <span className="tabular-nums relative z-10" style={{ color: 'var(--upbit-text-dim)' }}>
                  {formatQty(b.quantity)}
                </span>
              </div>
            );
          })}
          {bidRows.length === 0 && (
            <p className="text-[12px] py-4 text-center" style={{ color: 'var(--upbit-text-dim)' }}>
              매수 호가 없음
            </p>
          )}
        </div>
      </div>
      <div>
        <div className="text-[11px] mb-1 font-medium" style={{ color: 'var(--upbit-text-dim)' }}>
          매도 호가
        </div>
        <div className="space-y-0.5">
          {askRows.map((a, i) => {
            const isCurrentPrice = currentPriceUsd != null && Math.abs(a.price_usd - currentPriceUsd) < 0.01;
            const isMyOrder = myOrderPrices.some((p) => Math.abs(p - a.price_usd) < 0.01);
            return (
              <div
                key={`ask-${i}-${a.price_usd}`}
                className="flex justify-between items-center text-[13px] relative py-1 px-2 rounded transition-colors"
                style={{
                  backgroundColor: isMyOrder
                    ? 'rgba(229,57,53,0.2)'
                    : isCurrentPrice
                      ? 'rgba(229,57,53,0.12)'
                      : undefined,
                }}
              >
                <div
                  className="absolute right-0 top-0 bottom-0 rounded-l"
                  style={{
                    width: `${Math.min(100, (a.quantity / maxAskQty) * 100)}%`,
                    background: 'linear-gradient(270deg, rgba(229,57,53,0.35) 0%, rgba(229,57,53,0.08) 100%)',
                    right: 0,
                    left: 'auto',
                  }}
                />
                <span
                  className="font-semibold tabular-nums relative z-10"
                  style={{ color: isCurrentPrice ? 'var(--upbit-ask)' : 'var(--upbit-ask)' }}
                >
                  {formatUsd(a.price_usd)}
                </span>
                <span className="tabular-nums relative z-10" style={{ color: 'var(--upbit-text-dim)' }}>
                  {formatQty(a.quantity)}
                </span>
              </div>
            );
          })}
          {askRows.length === 0 && (
            <p className="text-[12px] py-4 text-center" style={{ color: 'var(--upbit-text-dim)' }}>
              매도 호가 없음
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

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
        <p className="caption" style={{ color: 'var(--text-secondary)' }}>거래 준비 중</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <div className="caption mb-1 font-medium" style={{ color: 'var(--text-secondary)' }}>
          매수 호가
        </div>
        <div className="flex flex-col" style={{ gap: 2 }}>
          {bidRows.map((b, i) => (
              <div
                key={`bid-${i}-${b.price_usd}`}
                className="grid grid-cols-[60%_40%] items-center body-sm py-0.5 px-1"
                style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}
              >
                <span
                  className="font-semibold metric-number text-right"
                  style={{ color: 'var(--emerald)' }}
                >
                  {formatUsd(b.price_usd)}
                </span>
                <span className="caption metric-number text-right" style={{ color: 'var(--text-muted)' }}>
                  {formatQty(b.quantity)}
                </span>
              </div>
            ))}
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
        <div className="flex flex-col" style={{ gap: 2 }}>
          {askRows.map((a, i) => (
              <div
                key={`ask-${i}-${a.price_usd}`}
                className="grid grid-cols-[60%_40%] items-center body-sm py-0.5 px-1"
                style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}
              >
                <span
                  className="font-semibold metric-number text-right"
                  style={{ color: 'var(--accent-loss)' }}
                >
                  {formatUsd(a.price_usd)}
                </span>
                <span className="caption metric-number text-right" style={{ color: 'var(--text-muted)' }}>
                  {formatQty(a.quantity)}
                </span>
              </div>
            ))}
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

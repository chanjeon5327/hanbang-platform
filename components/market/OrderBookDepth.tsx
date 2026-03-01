'use client';

import React, { useMemo } from 'react';

type Row = { priceKrw: number; qty: number };

function krw(n: number) {
  return new Intl.NumberFormat('ko-KR').format(Math.round(n));
}

export default function OrderBookDepth({
  asks = [],
  bids = [],
  midPriceKrw = 0,
}: {
  asks: Row[];
  bids: Row[];
  midPriceKrw: number;
}) {
  const sortedAsks = useMemo(
    () => [...asks].sort((a, b) => b.priceKrw - a.priceKrw).slice(0, 8),
    [asks]
  );
  const sortedBids = useMemo(
    () => [...bids].sort((a, b) => b.priceKrw - a.priceKrw).slice(0, 8),
    [bids]
  );

  const maxQty = useMemo(() => {
    const a = Math.max(...sortedAsks.map(r => r.qty), 1);
    const b = Math.max(...sortedBids.map(r => r.qty), 1);
    return Math.max(a, b);
  }, [sortedAsks, sortedBids]);

  return (
    <div style={{
      marginTop: 16,
      borderRadius: 16,
      padding: 12,
      background: '#fff',
      border: '1px solid #eee'
    }}>

      {/* 매도 (위) */}
      {sortedAsks.map((r, i) => {
        const width = (r.qty / maxQty) * 100;
        return (
          <div key={i} style={{ position: 'relative', height: 28, marginBottom: 4 }}>
            <div style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: `${width}%`,
              background: 'rgba(239,68,68,0.25)'
            }} />
            <div style={{
              position: 'relative',
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0 6px',
              fontSize: 13,
              fontWeight: 600
            }}>
              <span style={{ color: '#ef4444' }}>₩{krw(r.priceKrw)}</span>
              <span>{krw(r.qty)}</span>
            </div>
          </div>
        );
      })}

      {/* 현재가 */}
      <div style={{
        textAlign: 'center',
        padding: '6px 0',
        fontWeight: 800,
        borderTop: '1px solid #eee',
        borderBottom: '1px solid #eee',
        margin: '6px 0'
      }}>
        현재가 ₩{krw(midPriceKrw)}
      </div>

      {/* 매수 (아래) */}
      {sortedBids.map((r, i) => {
        const width = (r.qty / maxQty) * 100;
        return (
          <div key={i} style={{ position: 'relative', height: 28, marginBottom: 4 }}>
            <div style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: `${width}%`,
              background: 'rgba(37,99,235,0.25)'
            }} />
            <div style={{
              position: 'relative',
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0 6px',
              fontSize: 13,
              fontWeight: 600
            }}>
              <span style={{ color: '#2563eb' }}>₩{krw(r.priceKrw)}</span>
              <span>{krw(r.qty)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

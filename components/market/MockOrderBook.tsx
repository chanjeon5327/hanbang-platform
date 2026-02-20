'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { formatKrw } from '@/lib/utils/format';
import './MockOrderBook.css';

type Row = { price: number; qty: number };

type Props = {
  basePriceKrw: number;
  loading?: boolean;
  theme?: 'light' | 'dark';
};

function generateRows(base: number, count: number, direction: 'up' | 'down'): Row[] {
  const step = Math.max(100, Math.floor(base * 0.002));
  const baseQty = 35;
  const variance = Math.floor(baseQty * 0.3);
  return Array.from({ length: count }, (_, i) => ({
    price: base + (direction === 'up' ? 1 : -1) * step * (i + 1),
    qty: Math.max(1, baseQty + Math.floor((Math.random() - 0.5) * 2 * variance)),
  }));
}

export default function MockOrderBook({ basePriceKrw, loading, theme = 'dark' }: Props) {
  const isLight = theme === 'light';
  const bgColor = isLight ? '#F9FAFB' : '#1F2937';
  const textMuted = isLight ? '#6B7280' : '#9CA3AF';
  const currentBg = isLight ? 'rgba(37,99,235,0.08)' : 'rgba(37,99,235,0.2)';
  const currentText = isLight ? '#111827' : 'white';
  const [currentPrice, setCurrentPrice] = useState(basePriceKrw);
  const [asks, setAsks] = useState<Row[]>([]);
  const [bids, setBids] = useState<Row[]>([]);
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);
  const [flashClass, setFlashClass] = useState<string | null>(null);
  const [flashedPrices, setFlashedPrices] = useState<Set<number>>(new Set());
  const prevRowsRef = useRef<{ asks: Row[]; bids: Row[] }>({ asks: [], bids: [] });
  const priceRef = useRef(currentPrice);
  priceRef.current = currentPrice;

  const tick = useCallback(() => {
    if (basePriceKrw <= 0) return;
    const delta = (Math.random() - 0.45) * basePriceKrw * 0.01;
    const nextPrice = Math.round(priceRef.current + delta);
    const d = delta > 0 ? 'up' : delta < 0 ? 'down' : null;
    setDirection(d);
    setFlashClass(d === 'up' ? 'flashGreen' : d === 'down' ? 'flashRed' : null);
    setTimeout(() => setFlashClass(null), 300);

    const newAsks = generateRows(nextPrice, 5, 'up');
    const newBids = generateRows(nextPrice, 5, 'down');
    const prev = prevRowsRef.current;
    const changed = new Set<number>();
    newAsks.forEach((r) => {
      const p = prev.asks.find((a) => a.price === r.price);
      if (p && p.qty !== r.qty) changed.add(r.price);
    });
    newBids.forEach((r) => {
      const p = prev.bids.find((b) => b.price === r.price);
      if (p && p.qty !== r.qty) changed.add(r.price);
    });
    setFlashedPrices(changed);
    setTimeout(() => setFlashedPrices(new Set()), 300);
    prevRowsRef.current = { asks: newAsks, bids: newBids };

    setCurrentPrice(nextPrice);
    setAsks(newAsks);
    setBids(newBids);
  }, [basePriceKrw]);

  useEffect(() => {
    if (basePriceKrw <= 0) return;
    const initAsks = generateRows(basePriceKrw, 5, 'up');
    const initBids = generateRows(basePriceKrw, 5, 'down');
    setCurrentPrice(basePriceKrw);
    setAsks(initAsks);
    setBids(initBids);
    prevRowsRef.current = { asks: initAsks, bids: initBids };
  }, [basePriceKrw]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const schedule = () => {
      tick();
      const delay = 300 + Math.random() * 300;
      timeoutId = setTimeout(schedule, delay);
    };
    timeoutId = setTimeout(schedule, 300 + Math.random() * 300);
    return () => clearTimeout(timeoutId);
  }, [tick]);

  const allQtys = [...asks, ...bids].map((r) => r.qty);
  const maxQty = Math.max(1, ...allQtys);

  const RowWithBar = ({
    r,
    side,
    i,
    isFlashed,
  }: {
    r: Row;
    side: 'ask' | 'bid';
    i: number;
    isFlashed?: boolean;
  }) => (
    <div
      key={`${side}-${i}`}
      className={isFlashed ? (side === 'ask' ? 'flashRed' : 'flashGreen') : ''}
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      <div
        className="volumeBar"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: `${(r.qty / maxQty) * 100}%`,
          background: side === 'ask' ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)',
        }}
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: 6,
          fontSize: 14,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <span style={{ color: side === 'ask' ? '#EF4444' : '#22C55E' }}>{formatKrw(r.price)}</span>
        <span style={{ color: textMuted }}>{r.qty}</span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div
        style={{
          height: 260,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: textMuted,
          fontSize: 14,
        }}
      >
        로딩 중...
      </div>
    );
  }

  return (
    <div
      style={{
        maxHeight: 260,
        overflowY: 'auto',
        background: bgColor,
        borderRadius: 12,
        padding: 8,
      }}
    >
      <div style={{ marginBottom: 4 }}>
        {asks
          .sort((a, b) => a.price - b.price)
          .reverse()
          .map((r, i) => (
            <RowWithBar key={`a-${i}`} r={r} side="ask" i={i} isFlashed={flashedPrices.has(r.price)} />
          ))}
      </div>

      <div
        className={flashClass ?? ''}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: 6,
          margin: '8px 0',
          background: currentBg,
          borderRadius: 8,
          fontWeight: 700,
          color: currentText,
        }}
      >
        <span>
          {formatKrw(currentPrice)}
          {direction === 'up' && <span style={{ color: '#22C55E', marginLeft: 4 }}>▲</span>}
          {direction === 'down' && <span style={{ color: '#EF4444', marginLeft: 4 }}>▼</span>}
        </span>
        <span>현재가</span>
      </div>

      <div>
        {bids
          .sort((a, b) => b.price - a.price)
          .map((r, i) => (
            <RowWithBar key={`b-${i}`} r={r} side="bid" i={i} isFlashed={flashedPrices.has(r.price)} />
          ))}
      </div>
    </div>
  );
}

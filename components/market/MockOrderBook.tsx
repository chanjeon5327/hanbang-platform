'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { formatKrw } from '@/lib/utils/format';
import './MockOrderBook.css';

type Row = { price: number; qty: number };

const PC_LINES = 5;
const MOBILE_LINES = 8;

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
  const currentBg = 'rgba(59,130,246,0.08)';
  const currentText = isLight ? '#111827' : 'white';
  const [currentPrice, setCurrentPrice] = useState(basePriceKrw);
  const [asks, setAsks] = useState<Row[]>([]);
  const [bids, setBids] = useState<Row[]>([]);
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);
  const [priceFlashClass, setPriceFlashClass] = useState<string | null>(null);
  const [flashedPrices, setFlashedPrices] = useState<Set<number>>(new Set());
  const prevPriceRef = useRef<number | null>(null);
  const [displayLines, setDisplayLines] = useState(PC_LINES);
  const prevRowsRef = useRef<{ asks: Row[]; bids: Row[] }>({ asks: [], bids: [] });
  const priceRef = useRef(currentPrice);
  priceRef.current = currentPrice;

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setDisplayLines(mq.matches ? MOBILE_LINES : PC_LINES);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const tick = useCallback(() => {
    if (basePriceKrw <= 0) return;
    const delta = (Math.random() - 0.45) * basePriceKrw * 0.01;
    const nextPrice = Math.round(priceRef.current + delta);
    const d = delta > 0 ? 'up' : delta < 0 ? 'down' : null;
    setDirection(d);
    const prevPrice = prevPriceRef.current;
    if (prevPrice !== null && nextPrice !== prevPrice) {
      setPriceFlashClass(d === 'up' ? 'priceUpFlash' : d === 'down' ? 'priceDownFlash' : null);
      setTimeout(() => setPriceFlashClass(null), 250);
    }
    prevPriceRef.current = nextPrice;

    const newAsks = generateRows(nextPrice, MOBILE_LINES, 'up');
    const newBids = generateRows(nextPrice, MOBILE_LINES, 'down');
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
    const initAsks = generateRows(basePriceKrw, MOBILE_LINES, 'up');
    const initBids = generateRows(basePriceKrw, MOBILE_LINES, 'down');
    setCurrentPrice(basePriceKrw);
    setAsks(initAsks);
    setBids(initBids);
    prevRowsRef.current = { asks: initAsks, bids: initBids };
    prevPriceRef.current = basePriceKrw;
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
      className={isFlashed ? 'orderRowFlash' : ''}
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
          position: 'relative',
          zIndex: 1,
        }}
      >
        <span style={{ color: side === 'ask' ? '#EF4444' : '#22C55E', fontWeight: 600 }}>{formatKrw(r.price)}</span>
        <span style={{ fontSize: 14, color: '#6B7280' }}>{r.qty}</span>
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

  const askSlice = asks.sort((a, b) => a.price - b.price).reverse().slice(0, displayLines);
  const bidSlice = bids.sort((a, b) => b.price - a.price).slice(0, displayLines);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        flex: 1,
        background: bgColor,
        borderRadius: 12,
        padding: 8,
      }}
    >
      <div style={{ marginBottom: 4, flex: 1, minHeight: 0 }}>
        {askSlice.map((r, i) => (
            <RowWithBar key={`a-${i}`} r={r} side="ask" i={i} isFlashed={flashedPrices.has(r.price)} />
          ))}
      </div>

      <div
        className={priceFlashClass ?? ''}
        style={{
          flexShrink: 0,
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

      <div style={{ flex: 1, minHeight: 0 }}>
        {bidSlice.map((r, i) => (
            <RowWithBar key={`b-${i}`} r={r} side="bid" i={i} isFlashed={flashedPrices.has(r.price)} />
          ))}
      </div>
    </div>
  );
}

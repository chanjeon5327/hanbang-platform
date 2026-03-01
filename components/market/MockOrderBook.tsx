'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { formatKrw } from '@/lib/utils/format';
import './MockOrderBook.css';
import detailStyles from '@/app/market/[id]/market-detail.module.css';

type Row = { price: number; qty: number };

const PC_LINES = 10;
const MOBILE_LINES = 10;
const TOTAL_LEVELS = 20;

type Props = {
  basePriceKrw: number;
  loading?: boolean;
  theme?: 'light' | 'dark';
  onPriceChange?: (price: number) => void;
};

function generateRows(base: number, count: number, direction: 'up' | 'down', surgeTop?: boolean): Row[] {
  const step = Math.max(100, Math.floor(base * 0.002));
  const baseQty = 35;
  const variance = Math.floor(baseQty * 0.3);
  const top3Multiplier = 2.2;
  const surgeMultiplier = surgeTop ? 3 : 1;
  return Array.from({ length: count }, (_, i) => {
    let qty = Math.max(1, baseQty + Math.floor((Math.random() - 0.5) * 2 * variance));
    if (i < 3) qty = Math.floor(qty * top3Multiplier);
    if (surgeTop && i < 2) qty = Math.floor(qty * surgeMultiplier);
    return {
      price: base + (direction === 'up' ? 1 : -1) * step * (i + 1),
      qty,
    };
  });
}

export default function MockOrderBook({ basePriceKrw, loading, theme = 'dark', onPriceChange }: Props) {
  const isLight = theme === 'light';
  const bgColor = isLight ? '#F9FAFB' : '#1F2937';
  const textMuted = isLight ? '#6B7280' : '#9CA3AF';
  const currentBg = 'rgba(59,130,246,0.08)';
  const currentText = isLight ? '#111827' : 'white';
  const [currentPrice, setCurrentPrice] = useState(basePriceKrw);
  const [displayPrice, setDisplayPrice] = useState(currentPrice);
  const [asks, setAsks] = useState<Row[]>([]);
  const [bids, setBids] = useState<Row[]>([]);
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);
  const [priceFlashClass, setPriceFlashClass] = useState<string | null>(null);
  const [impactKey, setImpactKey] = useState(0);
  const [flashedPrices, setFlashedPrices] = useState<Map<number, number>>(new Map());
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevPriceRef = useRef<number | null>(null);
  const [displayLines, setDisplayLines] = useState(PC_LINES);
  const prevRowsRef = useRef<{ asks: Row[]; bids: Row[] }>({ asks: [], bids: [] });
  const priceRef = useRef(currentPrice);
  priceRef.current = currentPrice;

  const targetPriceRef = useRef(currentPrice);
  const displayRef = useRef(currentPrice);
  const directionRef = useRef<'up' | 'down' | null>(null);
  const lastRoundedRef = useRef(currentPrice);

  useEffect(() => {
    return () => {
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    };
  }, []);

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

    const surgeTop = Math.random() < 0.1;
    const newAsks = generateRows(nextPrice, TOTAL_LEVELS, 'up', surgeTop);
    const newBids = generateRows(nextPrice, TOTAL_LEVELS, 'down', surgeTop);
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
    const ts = Date.now();
    setFlashedPrices((prev) => {
      const next = new Map(prev);
      changed.forEach((price) => next.set(price, ts));
      return next;
    });
    if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    flashTimeoutRef.current = setTimeout(() => {
      setFlashedPrices(new Map());
      flashTimeoutRef.current = null;
    }, 120);
    prevRowsRef.current = { asks: newAsks, bids: newBids };

    setCurrentPrice(nextPrice);
    setAsks(newAsks);
    setBids(newBids);
    onPriceChange?.(nextPrice);
  }, [basePriceKrw, onPriceChange]);

  useEffect(() => {
    if (basePriceKrw <= 0) return;
    const initAsks = generateRows(basePriceKrw, TOTAL_LEVELS, 'up');
    const initBids = generateRows(basePriceKrw, TOTAL_LEVELS, 'down');
    setCurrentPrice(basePriceKrw);
    setDisplayPrice(basePriceKrw);
    targetPriceRef.current = basePriceKrw;
    displayRef.current = basePriceKrw;
    lastRoundedRef.current = basePriceKrw;
    setAsks(initAsks);
    setBids(initBids);
    prevRowsRef.current = { asks: initAsks, bids: initBids };
    prevPriceRef.current = basePriceKrw;
  }, [basePriceKrw]);

  useEffect(() => {
    targetPriceRef.current = currentPrice;
    directionRef.current = direction;
    if (Math.abs(currentPrice - displayRef.current) < 3) {
      displayRef.current = currentPrice;
      lastRoundedRef.current = currentPrice;
      setDisplayPrice(currentPrice);
    }
  }, [currentPrice, direction]);

  const isFirstPriceRef = useRef(true);
  useEffect(() => {
    if (isFirstPriceRef.current) {
      isFirstPriceRef.current = false;
      return;
    }
    setImpactKey((k) => k + 1);
  }, [currentPrice]);

  useEffect(() => {
    const ALPHA_UP = 0.22;
    const ALPHA_DOWN = 0.08;
    let frameId: number;

    function loop() {
      const target = targetPriceRef.current;
      let display = displayRef.current;

      if (Math.abs(target - display) < 3) {
        display = target;
      } else {
        const delta = target - display;
        const alpha = delta > 0 ? ALPHA_UP : ALPHA_DOWN;
        display += delta * alpha;
      }

      displayRef.current = display;
      const rounded = Math.round(display);
      if (rounded !== lastRoundedRef.current) {
        lastRoundedRef.current = rounded;
        setDisplayPrice(rounded);
      }

      frameId = requestAnimationFrame(loop);
    }

    frameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, []);

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

  const barWidthRef = useRef<Map<string, number>>(new Map());
  const SMOOTH_ALPHA = 0.15;

  const allQtys = [...asks, ...bids].map((r) => r.qty);
  const maxQty = Math.max(1, ...allQtys);

  const RowWithBar = ({
    r,
    side,
    i,
    pulseKey,
  }: {
    r: Row;
    side: 'ask' | 'bid';
    i: number;
    pulseKey?: number;
  }) => {
    const key = `${side}-${r.price}`;
    const rawPct = (r.qty / maxQty) * 100;
    const prev = barWidthRef.current.get(key) ?? rawPct;
    const smoothed = prev + (rawPct - prev) * SMOOTH_ALPHA;
    barWidthRef.current.set(key, smoothed);
    const widthPct = Math.min(100, Math.max(2, smoothed));
    return (
    <div
      key={`${side}-${i}-${pulseKey ?? 'base'}`}
      className={pulseKey ? detailStyles.orderSizeChange : ''}
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      <div
        className="volumeBar"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: `${widthPct}%`,
          maxWidth: '100%',
          background: side === 'ask' ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.15)',
          transition: 'width 200ms ease-out',
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
        <span style={{ color: side === 'ask' ? '#ef4444' : '#3b82f6', fontWeight: 600 }}>{formatKrw(r.price)}</span>
        <span style={{ fontSize: 14, color: '#6B7280' }}>{r.qty}</span>
      </div>
    </div>
  );
  };

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

  const displayCount = Math.max(displayLines, 10);
  const askSlice = asks.sort((a, b) => a.price - b.price).reverse().slice(0, displayCount);
  const bidSlice = bids.sort((a, b) => b.price - a.price).slice(0, displayCount);

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
            <RowWithBar key={`a-${i}`} r={r} side="ask" i={i} pulseKey={flashedPrices.get(r.price)} />
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
        <span key={impactKey} className={impactKey > 0 ? detailStyles.priceImpact : ''}>
          {formatKrw(displayPrice)}
          {direction === 'up' && <span style={{ color: '#22C55E', marginLeft: 4 }}>▲</span>}
          {direction === 'down' && <span style={{ color: '#EF4444', marginLeft: 4 }}>▼</span>}
        </span>
        <span>현재가</span>
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        {bidSlice.map((r, i) => (
            <RowWithBar key={`b-${i}`} r={r} side="bid" i={i} pulseKey={flashedPrices.get(r.price)} />
          ))}
      </div>
    </div>
  );
}

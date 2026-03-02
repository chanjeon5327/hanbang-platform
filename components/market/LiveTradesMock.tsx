'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { formatPriceKRW, formatQty, formatKRW } from '@/lib/format/number';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import { useLiquidity } from './LiquidityContext';
import styles from '@/app/market/[id]/market-detail.module.css';

type Trade = { id: string; price: number; qty: number; side: 'buy' | 'sell'; time: string; isLarge?: boolean };

function nowTime() {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
}

const INITIAL: Trade[] = [
  { id: '1', price: 13520, qty: 5, side: 'buy', time: '14:42:31' },
  { id: '2', price: 13510, qty: 3, side: 'sell', time: '14:42:28' },
  { id: '3', price: 13520, qty: 10, side: 'buy', time: '14:42:25' },
  { id: '4', price: 13500, qty: 2, side: 'sell', time: '14:42:20' },
  { id: '5', price: 13520, qty: 7, side: 'buy', time: '14:42:15' },
];

type Props = {
  basePriceKrw: number;
};

export default function LiveTradesMock({ basePriceKrw }: Props) {
  const [trades, setTrades] = useState<Trade[]>(INITIAL);
  const [enteringIds, setEnteringIds] = useState<Set<string>>(new Set());
  const liquidity = useLiquidity();

  const clusterRef = useRef({ side: 'buy' as 'buy' | 'sell', count: 0, targetCount: 4 });

  const addTrade = useCallback(() => {
    const cluster = clusterRef.current;
    if (cluster.count >= cluster.targetCount) {
      cluster.side = cluster.side === 'buy' ? 'sell' : 'buy';
      cluster.count = 0;
      cluster.targetCount = 3 + Math.floor(Math.random() * 4);
    }
    cluster.count++;

    const side = cluster.side;
    const offset = (Math.random() - 0.5) * basePriceKrw * 0.008;
    const price = Math.round(basePriceKrw + offset);
    let qty = Math.max(1, Math.floor(Math.random() * 15) + 1);
    const isLarge = Math.random() < 0.05;
    if (isLarge) {
      qty = Math.min(999, Math.floor(qty * (5 + Math.random() * 6)));
    }

    const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newTrade: Trade = { id, price, qty, side, time: nowTime(), isLarge };
    setTrades((prev) => [newTrade, ...prev].slice(0, 20));
    setEnteringIds((prev) => new Set(prev).add(id));
    setTimeout(() => setEnteringIds((p) => { const s = new Set(p); s.delete(id); return s; }), 300);

    liquidity?.onTrade({ side, price, qty, isLarge });
  }, [basePriceKrw, liquidity]);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const schedule = () => {
      addTrade();
      const delay = 300 + Math.random() * 900;
      t = setTimeout(schedule, delay);
    };
    t = setTimeout(schedule, 500 + Math.random() * 500);
    return () => clearTimeout(t);
  }, [addTrade]);

  const initialVolume = INITIAL.reduce((s, t) => s + t.price * t.qty, 0);
  const displayVolume = (liquidity?.totalVolume ?? 0) + initialVolume;

  return (
    <div>
      <div className={styles.tickerList} style={{ lineHeight: 1.2, marginBottom: 8 }}>
        <div className={styles.orderSummaryRow} style={{ padding: '4px 0', marginBottom: 4 }}>
          <span className={styles.orderLabel}>24H 거래대금</span>
          <span className={`${styles.monoNum} ${styles.numCol} price-number`}>
            <AnimatedNumber value={displayVolume} format="krw" formatter={(n) => formatKRW(n)} />
          </span>
        </div>
        {trades.map((t) => (
          <div
            key={t.id}
            className={`${styles.tickerRow} ${styles.tickerRowCompact} ${enteringIds.has(t.id) ? styles.tradeEnter : ''} ${enteringIds.has(t.id) ? styles.tradeSpark : ''} ${t.isLarge ? styles.tradeLarge : ''}`}
          >
            <span
              className={`${styles.tickerPrice} ${styles.monoNum} ${styles.numCol} price-number ${t.side === 'buy' ? styles.pos : styles.neg}`}
            >
              {formatPriceKRW(t.price)}
            </span>
            <span className={`${styles.tickerQty} ${styles.monoNum} ${styles.numCol} price-number`}>{formatQty(t.qty)}주</span>
            <span className={styles.tickerTime}>{t.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

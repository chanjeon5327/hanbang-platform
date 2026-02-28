'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatKrw } from '@/lib/utils/format';
import styles from '@/app/market/[id]/market-detail.module.css';

type Trade = { id: string; price: number; qty: number; side: 'buy' | 'sell'; time: string };

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

  const addTrade = useCallback(() => {
    const side = Math.random() > 0.5 ? 'buy' : 'sell';
    const offset = (Math.random() - 0.5) * basePriceKrw * 0.01;
    const price = Math.round(basePriceKrw + offset);
    const qty = Math.max(1, Math.floor(Math.random() * 15) + 1);
    const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newTrade: Trade = { id, price, qty, side, time: nowTime() };
    setTrades((prev) => [newTrade, ...prev].slice(0, 20));
    setEnteringIds((prev) => new Set(prev).add(id));
    setTimeout(() => setEnteringIds((p) => { const s = new Set(p); s.delete(id); return s; }), 250);
  }, [basePriceKrw]);

  useEffect(() => {
    const t = setInterval(addTrade, 3500 + Math.random() * 2000);
    return () => clearInterval(t);
  }, [addTrade]);

  return (
    <div className={styles.tickerList}>
      {trades.map((t) => (
        <div
          key={t.id}
          className={`${styles.tickerRow} ${enteringIds.has(t.id) ? styles.tradeEnter : ''}`}
        >
          <span
            className={styles.tickerPrice}
            style={{ color: t.side === 'buy' ? '#2563EB' : '#DC2626' }}
          >
            {formatKrw(t.price)}
          </span>
          <span className={styles.tickerQty}>{t.qty}주</span>
          <span className={styles.tickerTime}>{t.time}</span>
        </div>
      ))}
    </div>
  );
}

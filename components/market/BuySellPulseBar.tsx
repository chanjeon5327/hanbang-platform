'use client';

import { useEffect, useState, useRef } from 'react';
import styles from '@/app/market/[id]/market-detail.module.css';

type Props = {
  buyPower?: number;
  sellPower?: number;
  useMock?: boolean;
};

function smoothValue(prev: number, target: number, alpha: number): number {
  return prev + (target - prev) * alpha;
}

export default function BuySellPulseBar({ buyPower: buyProp = 50, sellPower: sellProp = 50, useMock = true }: Props) {
  const [mockBuy, setMockBuy] = useState(55);
  const [mockSell, setMockSell] = useState(45);

  useEffect(() => {
    if (!useMock) return;
    const id = setInterval(() => {
      const d = (Math.random() - 0.48) * 5.6;
      setMockBuy((b) => Math.max(20, Math.min(80, b + d)));
      setMockSell((s) => Math.max(20, Math.min(80, s - d)));
    }, 1200);
    return () => clearInterval(id);
  }, [useMock]);

  const buyPropFinal = useMock ? mockBuy : buyProp;
  const sellPropFinal = useMock ? mockSell : sellProp;
  const [buy, setBuy] = useState(buyPropFinal);
  const [sell, setSell] = useState(sellPropFinal);
  const prevRef = useRef({ buy: buyPropFinal, sell: sellPropFinal });

  useEffect(() => {
    let rafId: number;
    function loop() {
      const { buy: pb, sell: ps } = prevRef.current;
      const nb = smoothValue(pb, buyPropFinal, 0.047);
      const ns = smoothValue(ps, sellPropFinal, 0.047);
      prevRef.current = { buy: nb, sell: ns };
      setBuy(nb);
      setSell(ns);
      rafId = requestAnimationFrame(loop);
    }
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [buyPropFinal, sellPropFinal]);

  const total = buy + sell || 1;
  const buyPct = Math.round((buy / total) * 100);
  const sellPct = 100 - buyPct;

  return (
    <div className={styles.pulseWrap} role="presentation">
      <div className={styles.pulseBar}>
        <div className={styles.pulseBuy} style={{ width: `${buyPct}%` }} />
        <div className={styles.pulseSell} style={{ width: `${sellPct}%` }} />
      </div>
    </div>
  );
}

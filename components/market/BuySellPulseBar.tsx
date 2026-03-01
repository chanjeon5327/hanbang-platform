'use client';

import { useEffect, useState, useRef } from 'react';
import styles from '@/app/market/[id]/market-detail.module.css';
import { useLiquidity } from './LiquidityContext';

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
  const liquidity = useLiquidity();
  const lastTradeRef = useRef(liquidity?.lastTrade ?? null);
  const pulseBoostRef = useRef(0);

  useEffect(() => {
    if (!useMock) return;
    const lt = liquidity?.lastTrade ?? null;
    if (lt && lt !== lastTradeRef.current) {
      lastTradeRef.current = lt;
      if (lt.side === 'buy') {
        setMockBuy((b) => Math.min(85, b + (lt.isLarge ? 18 : 6)));
        setMockSell((s) => Math.max(15, s - (lt.isLarge ? 18 : 6)));
      } else {
        setMockSell((s) => Math.min(85, s + (lt.isLarge ? 18 : 6)));
        setMockBuy((b) => Math.max(15, b - (lt.isLarge ? 18 : 6)));
      }
      if (lt.isLarge) pulseBoostRef.current = 1;
    }
    const id = setInterval(() => {
      if (liquidity) {
        const d = (Math.random() - 0.5) * 2;
        setMockBuy((b) => Math.max(20, Math.min(80, b + d)));
        setMockSell((s) => Math.max(20, Math.min(80, s - d)));
      } else {
        const d = (Math.random() - 0.48) * 5.6;
        setMockBuy((b) => Math.max(20, Math.min(80, b + d)));
        setMockSell((s) => Math.max(20, Math.min(80, s - d)));
      }
    }, liquidity ? 2000 : 1200);
    return () => clearInterval(id);
  }, [useMock, liquidity?.lastTrade, liquidity]);

  const buyPropFinal = useMock ? mockBuy : buyProp;
  const sellPropFinal = useMock ? mockSell : sellProp;
  const [buy, setBuy] = useState(buyPropFinal);
  const [sell, setSell] = useState(sellPropFinal);
  const prevRef = useRef({ buy: buyPropFinal, sell: sellPropFinal });

  useEffect(() => {
    let rafId: number;
    function loop() {
      const { buy: pb, sell: ps } = prevRef.current;
      const alpha = 0.04;
      const nb = smoothValue(pb, buyPropFinal, alpha);
      const ns = smoothValue(ps, sellPropFinal, alpha);
      prevRef.current = { buy: nb, sell: ns };
      setBuy(nb);
      setSell(ns);
      if (pulseBoostRef.current > 0) pulseBoostRef.current -= 0.02;
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

'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export type TradeEvent = { side: 'buy' | 'sell'; price: number; qty: number; isLarge: boolean };

type LiquidityContextValue = {
  totalVolume: number;
  lastTrade: TradeEvent | null;
  onTrade: (t: TradeEvent) => void;
};

const LiquidityContext = createContext<LiquidityContextValue | null>(null);

export function LiquidityProvider({ children }: { children: React.ReactNode }) {
  const [totalVolume, setTotalVolume] = useState(0);
  const [lastTrade, setLastTrade] = useState<TradeEvent | null>(null);

  const onTrade = useCallback((t: TradeEvent) => {
    setTotalVolume((v) => v + t.price * t.qty);
    setLastTrade(t);
  }, []);

  return (
    <LiquidityContext.Provider value={{ totalVolume, lastTrade, onTrade }}>
      {children}
    </LiquidityContext.Provider>
  );
}

export function useLiquidity() {
  const ctx = useContext(LiquidityContext);
  return ctx;
}

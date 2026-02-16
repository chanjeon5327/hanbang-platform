'use client';

import { useMemo } from 'react';
import { formatKrw, formatRate } from '@/lib/utils/format';

type Props = {
  sharePriceUsd: number | null;
  fxRate: number;
  pricingCurrency?: string;
  prevCloseUsd?: number | null;
  volume24h?: number | null;
};

function formatUsd(n: number): string {
  return `$${n.toFixed(2)}`;
}

function formatKrwShort(n: number): string {
  if (n >= 1_0000_0000) return `₩${(n / 1_0000_0000).toFixed(1)}억`;
  if (n >= 1_0000) return `₩${(n / 1_0000).toFixed(0)}만`;
  return `₩${Math.round(n).toLocaleString()}`;
}

export default function PriceHeader({
  sharePriceUsd,
  fxRate,
  prevCloseUsd,
  volume24h,
}: Props) {
  const { krw, changeRate, changeAmount } = useMemo(() => {
    if (sharePriceUsd == null) return { krw: 0, changeRate: 0, changeAmount: 0 };
    const k = sharePriceUsd * fxRate;
    const prev = prevCloseUsd ?? sharePriceUsd;
    const amt = sharePriceUsd - prev;
    const rate = prev > 0 ? (amt / prev) * 100 : 0;
    return { krw: k, changeRate: rate, changeAmount: amt * fxRate };
  }, [sharePriceUsd, fxRate, prevCloseUsd]);

  if (sharePriceUsd == null) return null;

  const isUp = changeRate > 0;
  const isDown = changeRate < 0;

  return (
    <div className="pb-3">
      <div className="flex items-baseline gap-3 flex-wrap">
        <span className="metric-xl font-extrabold tabular-nums tracking-tight" style={{ color: 'var(--text)' }}>
          {formatKrw(krw)}
        </span>
        <span className="caption tabular-nums" style={{ color: 'var(--text-secondary)' }}>
          {formatUsd(sharePriceUsd)}
        </span>
      </div>
      {prevCloseUsd != null && prevCloseUsd !== sharePriceUsd && (
        <span
          className="metric-lg font-bold tabular-nums inline-flex items-center gap-0.5 mt-1"
          style={{
            color: isUp ? 'var(--emerald)' : isDown ? 'var(--accent-loss)' : 'var(--text-secondary)',
          }}
        >
          {isUp ? '▲' : isDown ? '▼' : ''} {isUp ? '+' : ''}{formatRate(changeRate)} ({isUp ? '+' : ''}{formatKrw(changeAmount)})
        </span>
      )}
      {volume24h != null && volume24h > 0 && (
        <div className="caption mt-1" style={{ color: 'var(--text-secondary)' }}>
          거래량 {formatKrwShort(volume24h)}
        </div>
      )}
    </div>
  );
}

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
    <div className="py-4" style={{ borderBottom: '1px solid var(--upbit-border)' }}>
      <div className="text-[12px] mb-0.5" style={{ color: 'var(--upbit-text-dim)' }}>주당 가격</div>
      <div className="flex items-baseline gap-3 flex-wrap">
        <span className="text-[24px] font-extrabold tabular-nums" style={{ color: 'var(--upbit-text)' }}>
          {formatUsd(sharePriceUsd)}
        </span>
        <span className="text-[14px] font-semibold tabular-nums" style={{ color: 'var(--upbit-text-dim)' }}>
          {formatKrwShort(krw)}
        </span>
        {prevCloseUsd != null && prevCloseUsd !== sharePriceUsd && (
          <span
            className="text-[13px] font-semibold tabular-nums"
            style={{
              color: isUp ? 'var(--upbit-bid)' : isDown ? 'var(--upbit-ask)' : 'var(--upbit-text-dim)',
            }}
          >
            {isUp ? '+' : ''}{formatRate(changeRate)} ({isUp ? '+' : ''}{formatKrw(changeAmount)})
          </span>
        )}
      </div>
      {volume24h != null && volume24h > 0 && (
        <div className="text-[11px] mt-1" style={{ color: 'var(--upbit-text-dim)' }}>
          거래량 {formatKrwShort(volume24h)}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useMemo } from 'react';

type Props = {
  sharePriceUsd: number | null;
  totalRaiseUsd: number | null;
  currentRaiseUsd: number | null;
  fxRate: number;
};

function formatUsd(n: number): string {
  return `$${n.toFixed(2)}`;
}

function formatKrw(n: number, fx: number): string {
  if (n >= 1_0000_0000) return `₩${(n / 1_0000_0000).toFixed(1)}억`;
  if (n >= 1_0000) return `₩${(n / 1_0000).toFixed(0)}만`;
  return `₩${Math.round(n).toLocaleString()}`;
}

function SkeletonChart() {
  return (
    <div className="h-[200px] rounded-lg animate-pulse" style={{ backgroundColor: 'var(--border)' }} />
  );
}

export default function PriceChartBlock({ sharePriceUsd, totalRaiseUsd, currentRaiseUsd, fxRate }: Props) {
  const [chartTab, setChartTab] = useState<'1D' | '1W' | '1M'>('1D');

  const hasUsd = sharePriceUsd != null || (totalRaiseUsd != null && currentRaiseUsd != null);
  const progress = useMemo(() => {
    if (totalRaiseUsd == null || totalRaiseUsd <= 0 || currentRaiseUsd == null) return 0;
    return Math.min(100, (currentRaiseUsd / totalRaiseUsd) * 100);
  }, [totalRaiseUsd, currentRaiseUsd]);

  if (!hasUsd) return null;

  return (
    <div className="pt-4" style={{ marginTop: 'var(--space-md)', borderTop: '1px solid var(--border)' }}>
      <div className="flex gap-1 mb-3">
        {(['1D', '1W', '1M'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setChartTab(t)}
            className="px-3 py-1.5 caption font-semibold rounded-lg transition"
            style={{
              backgroundColor: chartTab === t ? 'var(--primary)' : 'transparent',
              color: chartTab === t ? '#fff' : 'var(--text-secondary)',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {sharePriceUsd != null && (
        <div className="flex items-baseline gap-2 mb-3">
          <span className="h3 font-extrabold tabular-nums" style={{ color: 'var(--text)' }}>
            {formatUsd(sharePriceUsd)}
          </span>
          <span className="body-sm font-semibold tabular-nums" style={{ color: 'var(--text-secondary)' }}>
            {formatKrw(sharePriceUsd, fxRate)}
          </span>
        </div>
      )}

      <div className="mb-3">
        <SkeletonChart />
      </div>

      {totalRaiseUsd != null && currentRaiseUsd != null && (
        <div>
          <div className="flex justify-between caption mb-1" style={{ color: 'var(--text-secondary)' }}>
            <span>모집 진행</span>
            <span className="tabular-nums font-semibold" style={{ color: 'var(--text)' }}>
              {formatUsd(currentRaiseUsd)} / {formatUsd(totalRaiseUsd)} ({Math.round(progress)}%)
            </span>
          </div>
          <div className="w-full rounded-full h-2 overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
            <div
              className="h-2 rounded-full transition-all"
              style={{ width: `${progress}%`, backgroundColor: 'var(--primary)' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

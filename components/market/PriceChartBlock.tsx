'use client';

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

export default function PriceChartBlock({ sharePriceUsd, totalRaiseUsd, currentRaiseUsd, fxRate }: Props) {
  const hasUsd = sharePriceUsd != null || (totalRaiseUsd != null && currentRaiseUsd != null);
  if (!hasUsd) return null;

  const progress = totalRaiseUsd != null && totalRaiseUsd > 0 && currentRaiseUsd != null
    ? Math.min(100, (currentRaiseUsd / totalRaiseUsd) * 100)
    : 0;

  return (
    <div className="py-4" style={{ borderBottom: '1px solid var(--upbit-border)' }}>
      {sharePriceUsd != null && (
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-[20px] font-extrabold tabular-nums" style={{ color: 'var(--upbit-text)' }}>
            {formatUsd(sharePriceUsd)}
          </span>
          <span className="text-[13px] font-semibold tabular-nums" style={{ color: 'var(--upbit-text-dim)' }}>
            {formatKrw(sharePriceUsd, fxRate)}
          </span>
        </div>
      )}
      {totalRaiseUsd != null && currentRaiseUsd != null && (
        <div>
          <div className="flex justify-between text-[12px] mb-1" style={{ color: 'var(--upbit-text-dim)' }}>
            <span>모집 진행</span>
            <span className="tabular-nums font-semibold" style={{ color: 'var(--upbit-text)' }}>
              {formatUsd(currentRaiseUsd)} / {formatUsd(totalRaiseUsd)} ({Math.round(progress)}%)
            </span>
          </div>
          <div className="w-full rounded-full h-2 overflow-hidden" style={{ backgroundColor: 'var(--upbit-border)' }}>
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

'use client';

type Props = {
  sharePriceUsd: number | null;
  fxRate: number;
  pricingCurrency?: string;
};

function formatUsd(n: number): string {
  return `$${n.toFixed(2)}`;
}

function formatKrw(n: number): string {
  if (n >= 1_0000_0000) return `₩${(n / 1_0000_0000).toFixed(1)}억`;
  if (n >= 1_0000) return `₩${(n / 1_0000).toFixed(0)}만`;
  return `₩${Math.round(n).toLocaleString()}`;
}

export default function PriceHeader({ sharePriceUsd, fxRate, pricingCurrency = 'USD' }: Props) {
  if (sharePriceUsd == null) return null;

  const krw = sharePriceUsd * fxRate;

  return (
    <div className="py-4" style={{ borderBottom: '1px solid var(--upbit-border)' }}>
      <div className="text-[12px] mb-0.5" style={{ color: 'var(--upbit-text-dim)' }}>주당 가격</div>
      <div className="flex items-baseline gap-3">
        <span className="text-[24px] font-extrabold tabular-nums" style={{ color: 'var(--upbit-text)' }}>
          {formatUsd(sharePriceUsd)}
        </span>
        <span className="text-[14px] font-semibold tabular-nums" style={{ color: 'var(--upbit-text-dim)' }}>
          {formatKrw(krw)}
        </span>
      </div>
    </div>
  );
}

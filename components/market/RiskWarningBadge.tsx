'use client';

type Props = {
  volatility?: number;
  threshold?: number;
};

export default function RiskWarningBadge({ volatility = 0, threshold = 20 }: Props) {
  if (volatility < threshold) return null;
  return (
    <span
      className="caption font-bold px-2 py-0.5 rounded-full"
      style={{ backgroundColor: 'var(--upbit-ask)', color: '#fff' }}
    >
      고위험
    </span>
  );
}

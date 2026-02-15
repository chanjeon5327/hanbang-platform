'use client';

type Props = {
  value: string | number;
  sub?: string;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
};

export default function MetricCard({ value, sub, trend, className = '' }: Props) {
  const trendColor = trend === 'up' ? 'var(--emerald)' : trend === 'down' ? 'var(--accent-loss)' : 'var(--text-secondary)';
  return (
    <div className={`rounded-2xl p-4 border ${className}`} style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="metric-number text-[24px] font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>{value}</div>
      {sub && <div className="text-[13px] mt-1" style={{ color: trendColor }}>{sub}</div>}
    </div>
  );
}

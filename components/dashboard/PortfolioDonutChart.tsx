'use client';

const COLORS = ['#3B82F6', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899', '#6B7280'];

type Item = { asset_id: string; title: string; current_value: number };

export default function PortfolioDonutChart({ items, maxShow = 5 }: { items: Item[]; maxShow?: number }) {
  const total = items.reduce((s, i) => s + i.current_value, 0);
  if (total <= 0) return null;

  const sorted = [...items].sort((a, b) => b.current_value - a.current_value);
  const top = sorted.slice(0, maxShow);
  const otherValue = sorted.slice(maxShow).reduce((s, i) => s + i.current_value, 0);
  const segments = otherValue > 0 ? [...top, { asset_id: 'other', title: '기타', current_value: otherValue }] : top;

  let acc = 0;
  const paths = segments.map((s, i) => {
    const pct = (s.current_value / total) * 100;
    const start = (acc / 100) * 360;
    acc += pct;
    const sweep = (pct / 100) * 360;
    const r = 40;
    const cx = 50;
    const cy = 50;
    const rad = (deg: number) => (deg * Math.PI) / 180;
    const x1 = cx + r * Math.cos(rad(-90 + start));
    const y1 = cy + r * Math.sin(rad(-90 + start));
    const x2 = cx + r * Math.cos(rad(-90 + start + sweep));
    const y2 = cy + r * Math.sin(rad(-90 + start + sweep));
    const large = sweep > 180 ? 1 : 0;
    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
    return { d, color: COLORS[i % COLORS.length], title: s.title, pct };
  });

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 100 100" className="w-24 h-24 flex-shrink-0">
        {paths.map((p, i) => (
          <path key={i} d={p.d} fill={p.color} opacity={0.9} />
        ))}
        <circle cx="50" cy="50" r="24" fill="var(--card)" />
      </svg>
      <div className="flex-1 space-y-1">
        {paths.map((p, i) => (
          <div key={i} className="flex items-center gap-2 caption">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
            <span className="truncate" style={{ color: 'var(--text-secondary)' }}>{p.title}</span>
            <span className="font-medium tabular-nums ml-auto">{p.pct.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

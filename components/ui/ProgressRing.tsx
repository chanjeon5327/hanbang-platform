'use client';

type Props = {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  className?: string;
};

export default function ProgressRing({ progress, size = 48, strokeWidth = 4, className = '' }: Props) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;
  return (
    <svg width={size} height={size} className={`-rotate-90 ${className}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={strokeWidth} />
      <circle
        cx={size/2}
        cy={size/2}
        r={r}
        fill="none"
        stroke="var(--royal-blue)"
        strokeWidth={strokeWidth}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.3s ease' }}
      />
    </svg>
  );
}

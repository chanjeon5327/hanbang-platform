'use client';

/**
 * MarketMiniChart — 경량형 스파크라인 (순수 SVG)
 *
 * 마켓 카드 / 리스트 행 등 좁은 공간에서 가격 추이를 빠르게 보여줌.
 * lightweight-charts 없이 SVG만으로 렌더. SSR-safe.
 *
 * 색상 규칙:
 *  - up=true  → Royal Blue (#1565C0) 계열
 *  - up=false → 빨간색 (#C62828) 계열
 *  - variant="white" → 밝은 배경 위 색상 대신 흰색 계열 (다크 카드 위)
 */

import { useMemo } from 'react';
import { hashSeed, mulberry32 } from '@/lib/mock/series';

type Props = {
  seed: string;
  basePrice: number;
  up?: boolean;
  /** "default" = 밝은 배경, "white" = 어두운 배경 위 (흰/반투명) */
  variant?: 'default' | 'white';
  height?: number;
  className?: string;
};

function generateSparklineValues(seed: string, basePrice: number, up: boolean, count = 40): number[] {
  const rnd = mulberry32(hashSeed(`mini:${seed}`));
  const values: number[] = [];
  let v = basePrice * (0.92 + rnd() * 0.10);
  const trend = up ? 1 : -1;

  for (let i = 0; i < count; i++) {
    const noise = (rnd() - 0.5) * basePrice * 0.008;
    const drift = trend * basePrice * 0.0025;
    v = Math.max(1, v + noise + drift);
    values.push(v);
  }
  // Scale so last = basePrice
  const scale = basePrice / values[values.length - 1];
  return values.map((x) => x * scale);
}

export default function MarketMiniChart({
  seed,
  basePrice,
  up = true,
  variant = 'default',
  height = 40,
  className = '',
}: Props) {
  const values = useMemo(
    () => generateSparklineValues(seed, basePrice, up, 36),
    [seed, basePrice, up],
  );

  const W   = 200;
  const H   = height;
  const PAD = 2;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(1, max - min);

  const xs = values.map((_, i) => PAD + (i / (values.length - 1)) * (W - PAD * 2));
  const ys = values.map((v) => PAD + ((max - v) / span) * (H - PAD * 2));

  const linePath = xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${ys[i].toFixed(1)}`).join(' ');
  const fillPath = `${linePath} L ${xs[xs.length - 1].toFixed(1)} ${H} L ${xs[0].toFixed(1)} ${H} Z`;

  // 색상 결정
  const isWhite = variant === 'white';
  const lineColor = isWhite
    ? up ? 'rgba(255,255,255,0.85)' : 'rgba(255,180,180,0.85)'
    : up ? '#1565C0'                : '#C62828';

  const fillTop  = isWhite
    ? up ? 'rgba(255,255,255,0.22)' : 'rgba(255,100,100,0.22)'
    : up ? 'rgba(21,101,192,0.16)'  : 'rgba(198,40,40,0.12)';

  const fillBot  = isWhite
    ? 'rgba(255,255,255,0.00)'
    : up ? 'rgba(21,101,192,0.00)'  : 'rgba(198,40,40,0.00)';

  const gradId = `mini-grad-${seed.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height={height}
      className={className}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={fillTop} />
          <stop offset="100%" stopColor={fillBot} />
        </linearGradient>
      </defs>

      {/* 채움 */}
      <path d={fillPath} fill={`url(#${gradId})`} />

      {/* 라인 */}
      <path
        d={linePath}
        fill="none"
        stroke={lineColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 마지막 점 */}
      <circle
        cx={xs[xs.length - 1].toFixed(1)}
        cy={ys[ys.length - 1].toFixed(1)}
        r="2.5"
        fill={lineColor}
      />
    </svg>
  );
}

'use client';

import { useId } from 'react';

type Theme = 'light' | 'dark';
type Mode = 'tick' | 'minute' | 'day';

function pad2(n: number) {
  return String(n).padStart(2, '0');
}
function fmtHM(d: Date) {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}
function addMinutes(d: Date, n: number) {
  const x = new Date(d);
  x.setMinutes(x.getMinutes() + n);
  return x;
}
function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function fmtMD(d: Date) {
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${m}/${day}`;
}

export default function UpbitLineBarsChart({
  values,
  theme = 'light',
  mode = 'minute',
  title,
  subtitle,
}: {
  values: number[];
  theme?: Theme;
  mode?: Mode;
  title?: string;
  subtitle?: string;
}) {
  const n = Math.max(2, values.length);
  const W = 760;
  const H = 280; // 한 장에 붙여서(선/바 간격 좁힘)
  const pad = 14;

  const LINE_TOP = pad;
  const LINE_H = 180;              // 위 선영역
  const BAR_TOP = LINE_TOP + LINE_H + 8; // 간격 최소(8px)
  const BAR_H = 70;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(1, max - min);

  const xs = Array.from({ length: n }, (_, i) => pad + (i * (W - pad * 2)) / (n - 1));
  const toY = (v: number) => LINE_TOP + (max - v) * ((LINE_H - 6) / span);
  const ys = values.map(toY);
  const path = `M ${xs.map((x, i) => `${x} ${ys[i]}`).join(' L ')}`;

  const deltas = values.map((v, i) => (i === 0 ? 0 : v - values[i - 1]));
  const absMax = Math.max(...deltas.map((d) => Math.abs(d))) || 1;

  const isDark = theme === 'dark';
  const bg = isDark ? '#0B1120' : '#FFFFFF';
  const grid = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)';
  const axisText = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)';
  const titleText = isDark ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.92)';
  const subText = isDark ? 'rgba(255,255,255,0.60)' : 'rgba(0,0,0,0.60)';

  // label 계산
  const end = new Date();
  let start: Date;
  if (mode === 'day') start = addDays(end, -(n - 1));
  else start = addMinutes(end, -(n - 1));

  const mid = mode === 'day'
    ? addDays(start, Math.floor((n - 1) / 2))
    : addMinutes(start, Math.floor((n - 1) / 2));

  const L1 = mode === 'tick' ? 'T-60' : mode === 'day' ? fmtMD(start) : fmtHM(start);
  const L2 = mode === 'tick' ? 'T-30' : mode === 'day' ? fmtMD(mid) : fmtHM(mid);
  const L3 = mode === 'tick' ? 'T0'   : mode === 'day' ? fmtMD(end) : fmtHM(end);

  const uid = useId().replace(/:/g, '');
  const lineGId = `lineG-${uid}`;
  const fillGId = `fillG-${uid}`;

  return (
    <div>
      {(title || subtitle) && (
        <div className="mb-3">
          {title && <div className="text-base font-extrabold" style={{ color: titleText }}>{title}</div>}
          {subtitle && <div className="text-sm" style={{ color: subText }}>{subtitle}</div>}
        </div>
      )}

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[280px]" style={{ background: bg, borderRadius: 16 }}>
        <defs>
          <linearGradient id={lineGId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="rgba(37,99,235,1)" />
            <stop offset="1" stopColor="rgba(124,58,237,1)" />
          </linearGradient>
          <linearGradient id={fillGId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgba(37,99,235,0.18)" />
            <stop offset="1" stopColor="rgba(37,99,235,0.00)" />
          </linearGradient>
        </defs>

        {/* grid */}
        {Array.from({ length: 5 }).map((_, i) => {
          const y = LINE_TOP + (i * (LINE_H - 8)) / 4;
          return <line key={i} x1={pad} x2={W - pad} y1={y} y2={y} stroke={grid} strokeWidth="1" />;
        })}

        {/* fill */}
        <path
          d={`${path} L ${xs[n - 1]} ${LINE_TOP + LINE_H} L ${xs[0]} ${LINE_TOP + LINE_H} Z`}
          fill={`url(#${fillGId})`}
        />

        {/* thin line stroke=2 */}
        <path d={path} fill="none" stroke={`url(#${lineGId})`} strokeWidth="2" strokeLinecap="round" />

        {/* last dot */}
        <circle cx={xs[n - 1]} cy={ys[n - 1]} r="5" fill={isDark ? 'rgba(255,255,255,0.90)' : 'rgba(0,0,0,0.85)'} />

        {/* bars baseline */}
        <line x1={pad} x2={W - pad} y1={BAR_TOP + BAR_H} y2={BAR_TOP + BAR_H} stroke={grid} strokeWidth="1" />

        {/* bars */}
        {deltas.map((d, i) => {
          const x = xs[i];
          const h = (Math.abs(d) / absMax) * (BAR_H - 6);
          const y = (BAR_TOP + BAR_H) - h;
          const color = d >= 0 ? 'rgba(37,99,235,0.70)' : 'rgba(239,68,68,0.70)';
          return (
            <rect key={i} x={x - 6} y={y} width="12" height={Math.max(2, h)} rx="3" fill={color} />
          );
        })}
      </svg>

      <div className="mt-2 flex items-center justify-between text-sm">
        <span style={{ color: axisText }}>{L1}</span>
        <span style={{ color: axisText }}>{L2}</span>
        <span style={{ color: axisText }}>{L3}</span>
      </div>
      <div className="mt-1 flex items-center justify-between text-xs">
        <span style={{ color: axisText }}>고점 {max} / 저점 {min}</span>
        <span style={{ color: axisText }}>{mode === 'tick' ? '틱 기준' : mode === 'minute' ? '1분 기준' : '일 기준'}</span>
      </div>
    </div>
  );
}

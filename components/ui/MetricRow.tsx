'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import Divider from './Divider';

export type MetricItem = {
  label: string;
  value: React.ReactNode;
  tone?: 'default' | 'muted' | 'positive' | 'negative';
};

type Props = {
  items: MetricItem[];
  columns?: 2 | 3;
  dense?: boolean;
  showDivider?: boolean;
  className?: string;
  valueClassName?: string;
  /** gap 12px, label opacity 0.6 (거래 탭용) */
  compact?: boolean;
};

const TONE_STYLE: Record<NonNullable<MetricItem['tone']>, string> = {
  default: 'var(--text)',
  muted: 'var(--text-secondary)',
  positive: 'var(--emerald)',
  negative: 'var(--accent-loss)',
};

export default function MetricRow({ items, columns = 2, dense = false, showDivider = false, className, valueClassName, compact = false }: Props) {
  const gridCols = columns === 3 ? 'grid-cols-3' : 'grid-cols-2';
  const valueCls = valueClassName ?? 'body-sm font-semibold';
  const gapX = compact ? 'gap-x-3' : 'gap-x-4';
  const labelStyle = { color: 'var(--text-secondary)', opacity: 0.6 };
  return (
    <div className={cn('flex flex-col', className)}>
      {showDivider && <Divider className="mb-3" />}
      <div className={cn('grid', gapX, gridCols, dense ? 'gap-y-2' : 'gap-y-3')}>
        {items.map((item, i) => (
          <div key={i} className="flex flex-col gap-0.5">
            <span className="caption" style={labelStyle}>
              {item.label}
            </span>
            <span
              className={cn(valueCls, 'metric-number')}
              style={{
                color: item.tone ? TONE_STYLE[item.tone] : 'var(--text)',
                opacity: 1,
              }}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

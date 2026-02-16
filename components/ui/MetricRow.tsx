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
};

const TONE_STYLE: Record<NonNullable<MetricItem['tone']>, string> = {
  default: 'var(--text)',
  muted: 'var(--text-secondary)',
  positive: 'var(--emerald)',
  negative: 'var(--accent-loss)',
};

export default function MetricRow({ items, columns = 2, dense = false, showDivider = false, className }: Props) {
  const gridCols = columns === 3 ? 'grid-cols-3' : 'grid-cols-2';
  return (
    <div className={cn('flex flex-col', className)}>
      {showDivider && <Divider className="mb-3" />}
      <div className={cn('grid gap-x-4', gridCols, dense ? 'gap-y-2' : 'gap-y-3')}>
        {items.map((item, i) => (
          <div key={i} className="flex flex-col gap-0.5">
            <span className="caption" style={{ color: 'var(--text-secondary)' }}>
              {item.label}
            </span>
            <span
              className="body-sm font-semibold metric-number"
              style={{
                color: item.tone ? TONE_STYLE[item.tone] : 'var(--text)',
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

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type HBChipTone = 'default' | 'blue' | 'green' | 'red' | 'amber' | 'muted';

interface HBChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: HBChipTone;
  size?: 'sm' | 'md';
}

const toneStyles: Record<HBChipTone, React.CSSProperties> = {
  default: { background: 'var(--bg-secondary)', color: 'var(--text)' },
  blue: { background: 'rgba(30, 64, 175, 0.1)', color: 'var(--royal-blue)' },
  green: { background: 'rgba(239, 68, 68, 0.1)', color: 'var(--emerald)' },
  red: { background: 'rgba(220, 38, 38, 0.1)', color: 'var(--accent-loss)' },
  amber: { background: 'rgba(245, 158, 11, 0.1)', color: '#D97706' },
  muted: { background: 'var(--bg-secondary)', color: 'var(--text-muted)' },
};

const HBChip = React.forwardRef<HTMLSpanElement, HBChipProps>(
  ({ className, tone = 'default', size = 'sm', children, style, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center font-semibold',
        size === 'sm' ? 'px-2 py-0.5 text-xs rounded-md' : 'px-3 py-1 text-sm rounded-lg',
        className,
      )}
      style={{ ...toneStyles[tone], ...style }}
      {...props}
    >
      {children}
    </span>
  ),
);
HBChip.displayName = 'HBChip';

export { HBChip };
export type { HBChipProps, HBChipTone };

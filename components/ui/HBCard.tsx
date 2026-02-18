'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type HBCardVariant = 'default' | 'ghost' | 'elevated' | 'royal';

interface HBCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: HBCardVariant;
  noPad?: boolean;
  hover?: boolean;
}

const variantStyles: Record<HBCardVariant, React.CSSProperties> = {
  default: {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow-sm)',
  },
  ghost: {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    boxShadow: 'none',
  },
  elevated: {
    background: 'var(--card-elevated)',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow-md)',
  },
  royal: {
    background: 'linear-gradient(135deg, var(--royal-blue), var(--royal-blue-dark))',
    border: 'none',
    boxShadow: '0 20px 40px rgba(30, 64, 175, 0.25)',
    color: 'white',
  },
};

const HBCard = React.forwardRef<HTMLDivElement, HBCardProps>(
  ({ className, style, variant = 'default', noPad = false, hover = false, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-[var(--radius-base)]',
        hover && 'hb-card-hover cursor-pointer',
        className,
      )}
      style={{
        padding: noPad ? 0 : 'var(--space-md)',
        borderRadius: 'var(--radius-base)',
        ...variantStyles[variant],
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  ),
);
HBCard.displayName = 'HBCard';

export { HBCard };
export type { HBCardProps, HBCardVariant };

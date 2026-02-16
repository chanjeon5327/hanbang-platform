'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

const CARD_V5_STYLE = {
  borderRadius: 'var(--radius-lg)',
  padding: '20px',
  border: '1px solid var(--border)',
  boxShadow: 'var(--shadow-sm)',
  backgroundColor: 'var(--card)',
} as const;

type CardV5Props = React.HTMLAttributes<HTMLDivElement> & {
  /** padding 제거 (이미지 등 풀블리드 영역용) */
  noPadding?: boolean;
  /** ghost: 패널용, border/shadow 얇게 */
  variant?: 'default' | 'ghost';
};

const CardV5 = React.forwardRef<HTMLDivElement, CardV5Props>(
  ({ className, style, noPadding, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-[20px] transition-opacity duration-200 md:hover:opacity-[0.98]',
        !noPadding && 'p-5',
        variant === 'ghost' && 'shadow-none',
        className
      )}
      style={{
        ...CARD_V5_STYLE,
        ...(noPadding ? { padding: 0 } : {}),
        ...(variant === 'ghost' ? { boxShadow: 'none', borderColor: 'var(--border)' } : {}),
        ...style,
      }}
      {...props}
    />
  )
);
CardV5.displayName = 'CardV5';

export { CardV5, CARD_V5_STYLE };

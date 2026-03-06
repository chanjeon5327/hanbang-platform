'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type HbBadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'premium';

interface HbBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: HbBadgeVariant;
}

const variantStyles: Record<HbBadgeVariant, string> = {
  default: 'bg-black/5 text-black/70 border border-black/10',
  success: 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/25',
  warning: 'bg-amber-500/15 text-amber-700 border border-amber-500/25',
  danger: 'bg-red-500/15 text-red-600 border border-red-500/25',
  premium: 'bg-[var(--royal-blue)]/15 text-[var(--royal-blue)] border border-[var(--royal-blue)]/25',
};

const HbBadge = React.forwardRef<HTMLSpanElement, HbBadgeProps>(
  ({ className, variant = 'default', children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  ),
);
HbBadge.displayName = 'HbBadge';

export { HbBadge };
export type { HbBadgeProps };

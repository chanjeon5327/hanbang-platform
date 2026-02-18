'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type HBButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type HBButtonSize = 'sm' | 'md' | 'lg';

interface HBButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: HBButtonVariant;
  size?: HBButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

const sizeMap: Record<HBButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-xl',
  md: 'px-5 py-2.5 text-sm rounded-2xl',
  lg: 'px-6 py-3.5 text-base rounded-2xl',
};

const variantMap: Record<HBButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
};

const HBButton = React.forwardRef<HTMLButtonElement, HBButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, fullWidth = false, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        variantMap[variant],
        sizeMap[size],
        'font-semibold transition-all',
        fullWidth && 'w-full',
        loading && 'opacity-60 pointer-events-none',
        className,
      )}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          {children}
        </span>
      ) : children}
    </button>
  ),
);
HBButton.displayName = 'HBButton';

export { HBButton };
export type { HBButtonProps };

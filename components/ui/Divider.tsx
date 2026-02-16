'use client';

import { cn } from '@/lib/utils';

type Props = {
  className?: string;
  variant?: 'line' | 'space';
};

export default function Divider({ className, variant = 'line' }: Props) {
  if (variant === 'space') {
    return <div className={cn('h-px', className)} style={{ opacity: 0 }} aria-hidden />;
  }
  return (
    <div
      className={cn('h-px shrink-0', className)}
      style={{
        height: 1,
        background: 'var(--border)',
        opacity: 0.6,
      }}
      aria-hidden
    />
  );
}

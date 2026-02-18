'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface HBSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Predefined shape */
  variant?: 'text' | 'circle' | 'rect' | 'card' | 'thumb';
  /** Width override */
  w?: string | number;
  /** Height override */
  h?: string | number;
}

export default function HBSkeleton({ className, variant = 'rect', w, h, style, ...props }: HBSkeletonProps) {
  const base = 'skeleton';
  const shapeClass = {
    text: 'rounded h-4 w-3/4',
    circle: 'rounded-full w-10 h-10',
    rect: 'rounded-lg',
    card: 'rounded-[var(--radius-base)] h-40',
    thumb: 'rounded-[var(--thumb-radius)] w-full',
  }[variant];

  const thumbStyle = variant === 'thumb' ? { paddingBottom: 'var(--thumb-ratio)' } : {};

  return (
    <div
      className={cn(base, shapeClass, className)}
      style={{ width: w, height: h, ...thumbStyle, ...style }}
      {...props}
    />
  );
}

/** Card skeleton preset: thumb + 2 text lines */
export function HBCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-[var(--radius-base)] overflow-hidden', className)} style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      <HBSkeleton variant="thumb" />
      <div className="p-4 space-y-2">
        <HBSkeleton variant="text" w="60%" />
        <HBSkeleton variant="text" w="40%" h={12} />
      </div>
    </div>
  );
}

/** Metric skeleton: number + label */
export function HBMetricSkeleton() {
  return (
    <div className="space-y-1">
      <HBSkeleton variant="text" w="50%" h={12} />
      <HBSkeleton variant="text" w="70%" h={20} />
    </div>
  );
}

/** Full-width empty state */
export function HBEmpty({ icon, message, action }: { icon?: React.ReactNode; message: string; action?: React.ReactNode }) {
  return (
    <div className="hb-empty">
      {icon && <div className="hb-empty-icon">{icon}</div>}
      <p className="body-sm" style={{ color: 'var(--text-muted)' }}>{message}</p>
      {action}
    </div>
  );
}

/** Error state with retry */
export function HBError({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="hb-empty">
      <div className="hb-empty-icon" style={{ background: 'rgba(220,38,38,0.08)', color: 'var(--accent-loss)' }}>!</div>
      <p className="body-sm" style={{ color: 'var(--text-muted)' }}>{message || 'Error occurred'}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-ghost text-xs px-4 py-2 rounded-xl" style={{ color: 'var(--royal-blue)' }}>
          Retry
        </button>
      )}
    </div>
  );
}

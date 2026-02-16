'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

type Props = {
  title?: string;
  subtitle?: string;
  rightHref?: string;
  rightLabel?: string;
  children: React.ReactNode;
  className?: string;
};

export default function Section({ title, subtitle, rightHref, rightLabel, children, className }: Props) {
  return (
    <section
      className={cn('px-4', className)}
      style={{ paddingTop: 'var(--space-lg)', paddingBottom: 'var(--space-lg)' }}
    >
      {(title || rightHref) && (
        <div className="flex items-center justify-between mb-4" style={{ gap: 'var(--space-md)' }}>
          <div>
            {title && (
              <h3 className="h3 font-bold" style={{ color: 'var(--text)' }}>{title}</h3>
            )}
            {subtitle && (
              <p className="body-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>
            )}
          </div>
          {rightHref && rightLabel && (
            <Link
              href={rightHref}
              className="body-sm font-semibold shrink-0"
              style={{ color: 'var(--royal-blue)' }}
            >
              {rightLabel}
            </Link>
          )}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {children}
      </div>
    </section>
  );
}

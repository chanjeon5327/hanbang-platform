'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  title: string;
  backHref?: string;
  backLabel?: string;
  right?: React.ReactNode;
  className?: string;
};

export default function TopAppBar({ title, backHref = '/', backLabel = '뒤로', right, className }: Props) {
  return (
    <header
      className={cn('sticky top-0 z-50 flex items-center justify-between h-14 px-4 gap-2', className)}
      style={{
        backgroundColor: 'var(--card)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {backHref ? (
        <Link
          href={backHref}
          className="p-2 -ml-2 rounded-xl shrink-0"
          style={{ color: 'var(--text-secondary)' }}
          aria-label={backLabel}
        >
          <ArrowLeft size={24} strokeWidth={2} />
        </Link>
      ) : (
        <div className="w-10 shrink-0" />
      )}
      <h1 className="flex-1 text-center body-lg font-bold truncate px-2" style={{ color: 'var(--text)' }}>
        {title}
      </h1>
      <div className="flex items-center justify-end shrink-0 min-w-[72px]">
        {right ?? null}
      </div>
    </header>
  );
}

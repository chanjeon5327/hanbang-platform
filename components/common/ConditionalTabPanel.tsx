'use client';

import type { ReactNode } from 'react';
import clsx from 'clsx';

type ConditionalTabPanelProps = {
  active: boolean;
  children: ReactNode;
  className?: string;
  keepMounted?: boolean;
};

export default function ConditionalTabPanel({
  active,
  children,
  className,
  keepMounted = false,
}: ConditionalTabPanelProps) {
  if (!active && !keepMounted) return null;

  return (
    <div
      className={clsx(
        className,
        !active && 'hidden h-0 overflow-hidden p-0 m-0 border-0',
      )}
      aria-hidden={!active}
    >
      {children}
    </div>
  );
}


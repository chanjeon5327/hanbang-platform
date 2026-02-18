'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface HBTab {
  key: string;
  label: string;
  count?: number;
}

interface HBTabsProps {
  tabs: HBTab[];
  active: string;
  onChange: (key: string) => void;
  size?: 'sm' | 'md';
  className?: string;
}

export default function HBTabs({ tabs, active, onChange, size = 'md', className }: HBTabsProps) {
  return (
    <div
      className={cn(
        'flex gap-1 overflow-x-auto no-scrollbar',
        size === 'sm' ? 'px-3 py-1' : 'px-4 py-2',
        className,
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={cn(
              'whitespace-nowrap transition-all',
              size === 'sm' ? 'px-3 py-1 text-xs rounded-lg' : 'px-4 py-2 text-sm rounded-xl',
              'font-semibold',
              isActive
                ? 'text-white'
                : 'hover:opacity-80',
            )}
            style={{
              background: isActive ? 'var(--royal-blue)' : 'var(--bg-secondary)',
              color: isActive ? '#fff' : 'var(--text-secondary)',
            }}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-1 opacity-70">{tab.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

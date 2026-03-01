'use client';

import { useEffect, useState } from 'react';
import { formatKrw } from '@/lib/utils/format';

type Props = {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  format?: 'number' | 'krw';
};

export default function AnimatedNumber({ value, duration = 600, decimals = 0, prefix = '', suffix = '', className = '', format: fmt = 'number' }: Props) {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const start = display;
    const diff = value - start;
    if (diff === 0) return;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 1.5);
      setDisplay(start + diff * eased);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value, duration]);

  const formatted = fmt === 'krw' ? formatKrw(Math.round(display)) : (decimals > 0 ? display.toFixed(decimals) : Math.round(display).toString());
  return (
    <span className={className}>
      {prefix}{formatted}{suffix}
    </span>
  );
}

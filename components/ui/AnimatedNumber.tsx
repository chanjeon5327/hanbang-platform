'use client';

import { useEffect, useState } from 'react';

type Props = {
  value: number;
  duration?: number;
  format?: (n: number) => string;
};

export default function AnimatedNumber({ value, duration = 400, format = (n) => n.toLocaleString() }: Props) {
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    let start = display;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (value - start) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value, duration]);
  return <span className="tabular-nums">{format(display)}</span>;
}

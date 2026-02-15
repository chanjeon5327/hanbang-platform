'use client';

import { useState } from 'react';

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function HoverLift({ children, className = '' }: Props) {
  const [hover, setHover] = useState(false);
  return (
    <div
      className={`transition-all duration-200 ${className}`}
      style={{
        transform: hover ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hover ? '0 12px 24px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.06)',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
    </div>
  );
}

'use client';

import { useState } from 'react';

type Props = {
  content: string;
  children: React.ReactNode;
};

export default function Tooltip({ content, children }: Props) {
  const [show, setShow] = useState(false);
  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <span
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded text-[12px] whitespace-nowrap z-[100]"
          style={{ backgroundColor: 'var(--text)', color: '#fff' }}
        >
          {content}
        </span>
      )}
    </span>
  );
}

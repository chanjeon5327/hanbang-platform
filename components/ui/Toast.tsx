'use client';

import { useEffect, useState } from 'react';

type ToastProps = {
  message: string;
  visible: boolean;
  onHide: () => void;
};

export default function Toast({ message, visible, onHide }: ToastProps) {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(onHide, 3000);
    return () => clearTimeout(t);
  }, [visible, onHide]);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-xl shadow-sm"
      style={{ backgroundColor: 'var(--upbit-text)', color: '#fff' }}
    >
      <span className="body-sm font-medium">{message}</span>
    </div>
  );
}

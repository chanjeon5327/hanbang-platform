'use client';

import React from 'react';

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

export default function TradeBottomSheet({ open, title, onClose, children }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999]">
      <button type="button" aria-label="닫기" className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-white p-4 shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-base font-extrabold">{title}</div>
          <button type="button" onClick={onClose} className="rounded-lg bg-gray-100 px-3 py-1 text-sm font-bold text-gray-700">
            닫기
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

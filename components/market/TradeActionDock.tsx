'use client';

import React from 'react';

type Props = {
  onBuy: () => void;
  onSell: () => void;
  onEdit: () => void;
  onFills: () => void;
  bottomOffsetPx?: number;
};

export default function TradeActionDock({ onBuy, onSell, onEdit, onFills, bottomOffsetPx = 72 }: Props) {
  return (
    <div className="fixed left-0 right-0 z-40 border-t bg-white/95 backdrop-blur" style={{ bottom: bottomOffsetPx }}>
      <div className="mx-auto flex max-w-md gap-2 px-4 py-3">
        <button type="button" onClick={onBuy} className="flex-1 rounded-xl bg-rose-600 px-3 py-3 text-sm font-extrabold text-white">
          구매
        </button>
        <button type="button" onClick={onSell} className="flex-1 rounded-xl bg-blue-600 px-3 py-3 text-sm font-extrabold text-white">
          판매
        </button>
        <button type="button" onClick={onEdit} className="flex-1 rounded-xl bg-gray-200 px-3 py-3 text-sm font-bold text-gray-800">
          주문수정
        </button>
        <button type="button" onClick={onFills} className="flex-1 rounded-xl bg-gray-200 px-3 py-3 text-sm font-bold text-gray-800">
          체결내역
        </button>
      </div>
    </div>
  );
}

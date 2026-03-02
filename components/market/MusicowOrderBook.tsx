'use client';

import React, { useMemo, useState } from 'react';

type Level = { price: number; qty: number };
type Props = {
  basePriceKrw: number;
  onPickPrice?: (p: number) => void;
};

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function formatNum(n: number) {
  return n.toLocaleString('ko-KR');
}

export default function MusicowOrderBook({ basePriceKrw, onPickPrice }: Props) {
  const step = 100;
  const depth = 10;

  const [selected, setSelected] = useState<number | null>(null);

  const { asks, bids, maxQty } = useMemo(() => {
    const seed = Math.floor(basePriceKrw / step);
    const rnd = mulberry32(seed);

    const mkQty = () => Math.floor(rnd() * 80) + 10;

    const a: Level[] = [];
    const b: Level[] = [];

    for (let i = depth; i >= 1; i--) a.push({ price: basePriceKrw + i * step, qty: mkQty() });
    for (let i = 1; i <= depth; i++) b.push({ price: basePriceKrw - i * step, qty: mkQty() });

    const max = Math.max(...a.map((x) => x.qty), ...b.map((x) => x.qty), 1);
    return { asks: a, bids: b, maxQty: max };
  }, [basePriceKrw]);

  function pick(p: number) {
    setSelected(p);
    onPickPrice?.(p);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
      <div className="grid grid-cols-3 border-b bg-gray-50 px-3 py-2 text-[11px] font-extrabold text-gray-600">
        <div className="text-left">판매 수량</div>
        <div className="text-center">가격</div>
        <div className="text-right">구매 수량</div>
      </div>

      <div className="divide-y">
        {asks.map((x) => {
          const bar = Math.round((x.qty / maxQty) * 100);
          const isSel = selected === x.price;
          return (
            <button
              key={`a-${x.price}`}
              type="button"
              onClick={() => pick(x.price)}
              className={`grid w-full grid-cols-3 items-center px-3 py-[9px] text-sm ${isSel ? 'bg-rose-50' : 'bg-white'}`}
            >
              <div className="text-left font-semibold text-gray-800">{x.qty}</div>
              <div className="relative text-center font-black text-rose-600 tabular-nums">
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 rounded-md bg-rose-100" style={{ width: `${Math.max(12, bar)}%`, opacity: 0.8 }} />
                <div className="relative z-10">{formatNum(x.price)}</div>
              </div>
              <div className="text-right text-gray-400"> </div>
            </button>
          );
        })}

        <div className="grid grid-cols-3 items-center px-3 py-2 text-xs font-extrabold">
          <div />
          <div className="text-center text-gray-900">
            {formatNum(basePriceKrw)} <span className="ml-1 text-gray-500">현재가</span>
          </div>
          <div />
        </div>

        {bids.map((x) => {
          const bar = Math.round((x.qty / maxQty) * 100);
          const isSel = selected === x.price;
          return (
            <button
              key={`b-${x.price}`}
              type="button"
              onClick={() => pick(x.price)}
              className={`grid w-full grid-cols-3 items-center px-3 py-[9px] text-sm ${isSel ? 'bg-blue-50' : 'bg-white'}`}
            >
              <div className="text-left text-gray-400"> </div>
              <div className="relative text-center font-black text-blue-600 tabular-nums">
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 rounded-md bg-blue-100" style={{ width: `${Math.max(12, bar)}%`, opacity: 0.85 }} />
                <div className="relative z-10">{formatNum(x.price)}</div>
              </div>
              <div className="text-right font-semibold text-gray-800">{x.qty}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

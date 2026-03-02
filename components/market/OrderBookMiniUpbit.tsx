'use client';

import { useMemo } from 'react';
import { formatKRW } from '@/lib/mock/marketItems';
import { hashSeed, mulberry32 } from '@/lib/mock/series';

type Row = { price: number; qty: number };

function tickSize(p: number) {
  if (p >= 1000000) return 1000;
  if (p >= 100000) return 100;
  if (p >= 10000) return 10;
  return 1;
}

export default function OrderBookMiniUpbit({
  assetId,
  basePrice,
  onPickPrice,
}: {
  assetId: string;
  basePrice: number;
  onPickPrice?: (price: number) => void;
}) {
  const { asks, bids } = useMemo(() => {
    const rnd = mulberry32(hashSeed(`ob:${assetId}`));
    const t = tickSize(basePrice);

    const mkQty = () => Number((rnd() * 8 + 0.15).toFixed(3));
    const asksRaw: Row[] = Array.from({ length: 5 }, (_, i) => ({
      price: Math.max(1, Math.round((basePrice + (i + 1) * t) / t) * t),
      qty: mkQty(),
    }));
    // 업비트 느낌: 매도는 위가 더 비싸게(내림차순)
    const asks = asksRaw.sort((a, b) => b.price - a.price);

    const bids: Row[] = Array.from({ length: 5 }, (_, i) => ({
      price: Math.max(1, Math.round((basePrice - i * t) / t) * t),
      qty: mkQty(),
    }));

    return { asks, bids };
  }, [assetId, basePrice]);

  const maxAsk = Math.max(...asks.map((x) => x.qty), 1);
  const maxBid = Math.max(...bids.map((x) => x.qty), 1);

  return (
    <div className="rounded-2xl border border-black/10 bg-white overflow-hidden shadow-[0_6px_20px_rgba(0,0,0,0.05)]">
      <div className="px-4 py-3 bg-black/5 flex items-center justify-between">
        <div className="text-sm font-extrabold">호가</div>
        <div className="text-xs text-black/55">각 5개</div>
      </div>

      <div className="grid grid-cols-2">
        {/* 매도 */}
        <div className="p-4 border-r border-black/10">
          <div className="text-xs text-black/55 mb-2">매도</div>
          <div className="space-y-2">
            {asks.map((r, idx) => {
              const w = Math.round((r.qty / maxAsk) * 100);
              return (
                <button
                  key={idx}
                  onClick={() => onPickPrice?.(r.price)}
                  className="relative w-full rounded-xl border border-black/10 bg-white hover:bg-red-50 transition overflow-hidden"
                >
                  {/* bar */}
                  <div
                    className="absolute inset-y-0 right-0 bg-red-500/10"
                    style={{ width: `${w}%` }}
                  />
                  <div className="relative px-3 py-2 flex items-center justify-between">
                    <div className="text-sm font-extrabold tabular-nums text-red-600">
                      {formatKRW(r.price)}
                    </div>
                    <div className="text-sm tabular-nums text-black/70">
                      {r.qty}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 매수 */}
        <div className="p-4">
          <div className="text-xs text-black/55 mb-2">매수</div>
          <div className="space-y-2">
            {bids.map((r, idx) => {
              const w = Math.round((r.qty / maxBid) * 100);
              return (
                <button
                  key={idx}
                  onClick={() => onPickPrice?.(r.price)}
                  className="relative w-full rounded-xl border border-black/10 bg-white hover:bg-blue-50 transition overflow-hidden"
                >
                  {/* bar */}
                  <div
                    className="absolute inset-y-0 left-0 bg-blue-500/10"
                    style={{ width: `${w}%` }}
                  />
                  <div className="relative px-3 py-2 flex items-center justify-between">
                    <div className="text-sm font-extrabold tabular-nums text-blue-700">
                      {formatKRW(r.price)}
                    </div>
                    <div className="text-sm tabular-nums text-black/70">
                      {r.qty}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

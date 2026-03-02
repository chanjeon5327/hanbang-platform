'use client';

import React from 'react';
import { formatKrw, formatRate } from '@/lib/utils/format';
import { PRODUCT_PLACEHOLDER } from '@/lib/thumbnails';

type Props = {
  title: string;
  thumbnailUrl?: string | null;
  priceKrw: number;
  changeRate: number;
  metaLeft?: string;
  metaRight?: string;
};

export default function MusicowAssetHeader({
  title,
  thumbnailUrl,
  priceKrw,
  changeRate,
  metaLeft = '현재가',
  metaRight = '전일 대비',
}: Props) {
  const isUp = changeRate >= 0;
  const changeText = `${isUp ? '+' : ''}${formatRate(changeRate)}%`;

  return (
    <div className="mb-3 rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
      <div className="flex gap-3">
        <div className="h-16 w-16 overflow-hidden rounded-xl bg-gray-100">
          <img
            src={thumbnailUrl || PRODUCT_PLACEHOLDER}
            alt={title}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = PRODUCT_PLACEHOLDER;
            }}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="line-clamp-1 text-sm font-extrabold text-gray-900">{title}</div>

          <div className="mt-2 flex items-end justify-between">
            <div>
              <div className="text-[11px] font-bold text-gray-500">{metaLeft}</div>
              <div className="text-2xl font-black tracking-tight text-gray-900">{formatKrw(priceKrw)}</div>
            </div>

            <div className="text-right">
              <div className="text-[11px] font-bold text-gray-500">{metaRight}</div>
              <div className={`text-sm font-extrabold ${isUp ? 'text-rose-600' : 'text-blue-600'}`}>{changeText}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

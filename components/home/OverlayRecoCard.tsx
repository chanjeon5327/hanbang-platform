'use client';

import React from 'react';
import { PRODUCT_PLACEHOLDER } from '@/lib/thumbnails';

type Props = {
  title: string;
  priceText?: string;
  changeText?: string; // 예: +4.2%
  badgeText?: string; // 예: "안정형"
  thumbnailUrl?: string | null;
  onClick?: () => void;
};

export default function OverlayRecoCard({
  title,
  priceText,
  changeText,
  badgeText,
  thumbnailUrl,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative h-[140px] w-[140px] overflow-hidden rounded-2xl border border-black/5 bg-gray-100 shadow-sm"
    >
      <img
        src={thumbnailUrl || PRODUCT_PLACEHOLDER}
        alt={title}
        className="h-full w-full object-cover"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = PRODUCT_PLACEHOLDER;
        }}
      />

      {/* 상단 배지 */}
      {badgeText && (
        <div className="absolute left-2 top-2 rounded-full bg-black/55 px-2 py-1 text-[11px] font-extrabold text-white">
          {badgeText}
        </div>
      )}

      {/* 우상단 등락 */}
      {changeText && (
        <div className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[11px] font-extrabold text-gray-900">
          {changeText}
        </div>
      )}

      {/* 하단 오버레이 텍스트 */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-2 pb-2 pt-6 text-left">
        <div className="line-clamp-1 text-[12px] font-extrabold text-white">{title}</div>
        {priceText && <div className="mt-0.5 text-[11px] font-bold text-white/90 tabular-nums">{priceText}</div>}
      </div>
    </button>
  );
}

/**
 * /exchange/[assetId] — Upbit형 거래 페이지
 * 모바일 우선: 오더북, 최근체결, 주문패널, 내 주문, 배당 정보
 */
'use client';

import { use } from 'react';
import OrderBookPanel from '@/components/exchange/OrderBookPanel';
import RecentTradesPanel from '@/components/exchange/RecentTradesPanel';
import PlaceOrderPanel from '@/components/exchange/PlaceOrderPanel';
import MyOrdersPanel from '@/components/exchange/MyOrdersPanel';
import DividendInfoPanel from '@/components/exchange/DividendInfoPanel';

export default function ExchangePage({ params }: { params: Promise<{ assetId: string }> }) {
  const { assetId } = use(params);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary, #f9fafb)' }}>
      {/* 상단 헤더 */}
      <div className="sticky top-0 z-10 px-4 py-3 border-b"
        style={{ backgroundColor: 'var(--card-bg, #fff)', borderColor: 'var(--border-color, #e5e7eb)' }}>
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary, #111)' }}>
            거래소
          </h1>
          <span className="text-xs px-2 py-0.5 rounded-full font-mono"
            style={{ backgroundColor: 'var(--bg-secondary, #f3f4f6)', color: 'var(--text-muted, #9ca3af)' }}>
            {assetId.slice(0, 8)}...
          </span>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-6xl mx-auto p-4">
        {/* 배당 정보 (있으면 상단 배너) */}
        <div className="mb-4">
          <DividendInfoPanel assetId={assetId} />
        </div>

        {/* 데스크톱: 3단 레이아웃 / 모바일: 스택 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* 오더북 (4칸) */}
          <div className="lg:col-span-4">
            <OrderBookPanel assetId={assetId} />
          </div>

          {/* 주문 패널 + 최근 체결 (5칸) */}
          <div className="lg:col-span-5 space-y-4">
            <PlaceOrderPanel assetId={assetId} />
            <RecentTradesPanel assetId={assetId} />
          </div>

          {/* 내 주문 (3칸) */}
          <div className="lg:col-span-3">
            <MyOrdersPanel assetId={assetId} />
          </div>
        </div>
      </div>
    </div>
  );
}

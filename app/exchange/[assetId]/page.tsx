/**
 * /exchange/[assetId] — Upbit형 거래 페이지
 * HANBANG Design V1: 통일된 카드/토큰/모션
 */
'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import OrderBookPanel from '@/components/exchange/OrderBookPanel';
import RecentTradesPanel from '@/components/exchange/RecentTradesPanel';
import PlaceOrderPanel from '@/components/exchange/PlaceOrderPanel';
import MyOrdersPanel from '@/components/exchange/MyOrdersPanel';
import DividendInfoPanel from '@/components/exchange/DividendInfoPanel';

export default function ExchangePage({ params }: { params: Promise<{ assetId: string }> }) {
  const { assetId } = use(params);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      {/* 상단 헤더 */}
      <div
        className="sticky top-0 z-10 px-4 py-3 border-b"
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Link href="/market" className="p-1 rounded-lg hover:opacity-80 transition" style={{ color: 'var(--text-secondary)' }}>
            <ArrowLeft size={20} />
          </Link>
          <h1 className="h3" style={{ color: 'var(--text)' }}>
            거래소
          </h1>
          <span
            className="caption px-2 py-0.5 rounded-md font-mono"
            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
          >
            {assetId.slice(0, 8)}...
          </span>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-6xl mx-auto p-4 hb-stagger">
        {/* 배당 정보 배너 */}
        <div className="mb-4">
          <DividendInfoPanel assetId={assetId} />
        </div>

        {/* 데스크톱: 3단 레이아웃 / 모바일: 스택 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-4">
            <OrderBookPanel assetId={assetId} />
          </div>
          <div className="lg:col-span-5 space-y-4">
            <PlaceOrderPanel assetId={assetId} />
            <RecentTradesPanel assetId={assetId} />
          </div>
          <div className="lg:col-span-3">
            <MyOrdersPanel assetId={assetId} />
          </div>
        </div>
      </div>
    </div>
  );
}

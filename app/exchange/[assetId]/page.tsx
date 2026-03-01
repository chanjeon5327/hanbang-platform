/**
 * /exchange/[assetId] — Upbit형 거래 페이지
 * HANBANG Design V1: 통일된 카드/토큰/모션
 * Design pass: hb-stagger fadeUp, HBCard 통일, sticky 헤더 backdrop-blur
 */
'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Activity } from 'lucide-react';
import OrderBookPanel from '@/components/exchange/OrderBookPanel';
import RecentTradesPanel from '@/components/exchange/RecentTradesPanel';
import PlaceOrderPanel from '@/components/exchange/PlaceOrderPanel';
import MyOrdersPanel from '@/components/exchange/MyOrdersPanel';
import DividendInfoPanel from '@/components/exchange/DividendInfoPanel';

export default function ExchangePage({ params }: { params: Promise<{ assetId: string }> }) {
  const { assetId } = use(params);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      {/* 상단 헤더 — sticky + backdrop blur */}
      <div
        className="sticky top-0 z-20 px-4 py-3 border-b"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Link
            href="/market"
            className="p-2 rounded-xl transition hover:opacity-80"
            style={{ color: 'var(--text-secondary)', background: 'var(--bg-secondary)' }}
            aria-label="마켓으로"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="flex items-center gap-2">
            <Activity size={16} style={{ color: 'var(--royal-blue)' }} />
            <h1 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
              거래소
            </h1>
          </div>
          <span
            className="text-xs px-2 py-0.5 rounded-lg font-mono"
            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
          >
            {assetId.slice(0, 8)}…
          </span>
        </div>
      </div>

      {/* 메인 콘텐츠 — hb-stagger: 패널별 순차 fade-in */}
      <div className="max-w-6xl mx-auto p-4">
        {/* 배당 정보 배너 */}
        <div className="mb-4 hb-stagger">
          <DividendInfoPanel assetId={assetId} />
        </div>

        {/* 데스크톱: 3단 레이아웃 / 모바일: 스택 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 hb-stagger">
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

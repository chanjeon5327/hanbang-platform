'use client';

import { useState } from 'react';
import MobilePriceChart from '@/components/market/MobilePriceChart';
import { OrderBookSummary, OrderBookPanel } from '@/components/market/OrderBook';
import MobileOrderStickyBar from '@/components/market/MobileOrderStickyBar';
import MobileOrderPanel from '@/components/market/MobileOrderPanel';

/* ===============================
   Header
================================ */

function MobileProductHeader() {
  return (
    <section className="px-4 pt-4">
      <h1 className="text-xl font-bold">유튜브 채널 &lt;여행가 제이&gt;</h1>
      <p className="text-sm text-gray-500">크리에이터 · 여행</p>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-2xl font-bold">₩12,300</span>
        <span className="text-green-500 font-semibold">+3.2%</span>
      </div>
    </section>
  );
}

/* ===============================
   Funnel Join (v3.0)
================================ */

function JoinFunnelButton({ contentId }: { contentId: string }) {
  const [loading, setLoading] = useState(false);

  const join = async () => {
    if (loading) return;
    setLoading(true);

    try {
      await fetch('/api/funnel/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_id: contentId,
          source: 'detail',
        }),
      });
      alert('합류 완료. 이후 업데이트를 받아보실 수 있습니다.');
    } catch {
      alert('잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="px-4 mt-4">
      <button
        onClick={join}
        disabled={loading}
        className="w-full rounded-xl border border-gray-300 bg-white py-3 text-sm font-semibold"
      >
        {loading ? '처리 중…' : '👀 관심 콘텐츠로 합류하기'}
      </button>
    </section>
  );
}

/* ===============================
   Side Toggle
================================ */

function SideToggle({
  side,
  onChange,
}: {
  side: 'BUY' | 'SELL';
  onChange: (s: 'BUY' | 'SELL') => void;
}) {
  return (
    <section className="px-4 mt-4">
      <div className="grid grid-cols-2 rounded-xl border overflow-hidden">
        <button
          onClick={() => onChange('BUY')}
          className={`py-2 text-sm font-semibold ${
            side === 'BUY' ? 'bg-blue-600 text-white' : 'bg-white'
          }`}
        >
          매수
        </button>
        <button
          onClick={() => onChange('SELL')}
          className={`py-2 text-sm font-semibold ${
            side === 'SELL' ? 'bg-red-600 text-white' : 'bg-white'
          }`}
        >
          매도
        </button>
      </div>
    </section>
  );
}

/* ===============================
   Page
================================ */

export default function MarketDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');

  const [orderBookOpen, setOrderBookOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);

  // 더미 현재가(나중에 실데이터로 교체)
  const lastPrice = 12300;

  return (
    <main className="relative pb-32">
      <MobileProductHeader />

      {/* ✅ 가격 차트 */}
      <MobilePriceChart />

      {/* ✅ v3.0 퍼널 합류 (매수 이전 단계) */}
      <JoinFunnelButton contentId={params.id} />

      {/* ✅ 매수/매도 토글 */}
      <SideToggle side={side} onChange={setSide} />

      {/* ✅ 호가 요약/전체 */}
      <OrderBookSummary onOpen={() => setOrderBookOpen(true)} />
      <OrderBookPanel open={orderBookOpen} onClose={() => setOrderBookOpen(false)} />

      {/* ✅ 하단 스티키 버튼 (매수/매도 진입) */}
      <MobileOrderStickyBar
        side={side}
        price={lastPrice}
        change={3.2}
        onOpen={() => setOrderOpen(true)}
      />

      {/* ✅ 주문 바텀시트 */}
      <MobileOrderPanel
        open={orderOpen}
        side={side}
        price={lastPrice}
        onClose={() => setOrderOpen(false)}
      />
    </main>
  );
}

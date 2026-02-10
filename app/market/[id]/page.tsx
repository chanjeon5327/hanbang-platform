'use client';

import { useState } from 'react';
import MobilePriceChart from '@/components/market/MobilePriceChart';

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
   Order Book (Summary)
================================ */

function MobileOrderBookSummary({ onOpen }: { onOpen: () => void }) {
  const sell = [12350, 12340, 12330];
  const buy = [12290, 12280, 12270];

  return (
    <section className="px-4 mt-6">
      <div
        onClick={onOpen}
        className="border rounded-xl overflow-hidden cursor-pointer"
      >
        {sell.map((p) => (
          <div
            key={p}
            className="flex justify-between px-3 py-1 text-sm text-red-600"
          >
            <span>매도</span>
            <span>₩{p.toLocaleString()}</span>
          </div>
        ))}

        <div className="text-center py-2 font-bold bg-gray-100">
          ₩12,300
        </div>

        {buy.map((p) => (
          <div
            key={p}
            className="flex justify-between px-3 py-1 text-sm text-blue-600"
          >
            <span>매수</span>
            <span>₩{p.toLocaleString()}</span>
          </div>
        ))}
      </div>

      <p className="text-xs text-center text-gray-400 mt-2">
        탭하여 전체 호가 보기
      </p>
    </section>
  );
}

/* ===============================
   Order Book (Full Panel)
================================ */

function MobileOrderBookPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  const sell = Array.from({ length: 10 }, (_, i) => 12350 - i * 10);
  const buy = Array.from({ length: 10 }, (_, i) => 12290 - i * 10);

  return (
    <div className="fixed inset-0 z-[300] bg-black/40 flex items-end">
      <div className="w-full h-[80vh] bg-white rounded-t-2xl px-4 py-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg">호가</h2>
          <button onClick={onClose} className="text-sm text-gray-500">
            닫기
          </button>
        </div>

        {sell.map((p) => (
          <div
            key={`s-${p}`}
            className="flex justify-between py-1 text-red-600"
          >
            <span>매도</span>
            <span>₩{p.toLocaleString()}</span>
          </div>
        ))}

        <div className="text-center py-2 font-bold bg-gray-100 my-2">
          ₩12,300
        </div>

        {buy.map((p) => (
          <div
            key={`b-${p}`}
            className="flex justify-between py-1 text-blue-600"
          >
            <span>매수</span>
            <span>₩{p.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===============================
   Sticky Order Bar
================================ */

function MobileOrderStickyBar({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] border-t bg-white px-4 py-3">
      <button
        onClick={onOpen}
        className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold"
      >
        매수하기
      </button>
    </div>
  );
}

/* ===============================
   Page (C-1 안정화 버전)
================================ */

export default function MarketDetailPage() {
  const [orderBookOpen, setOrderBookOpen] = useState(false);

  return (
    <main className="relative pb-32">
      <MobileProductHeader />

      {/* ✅ 차트는 단독 렌더 (이 페이지에서는 이벤트 관여 X) */}
      <MobilePriceChart />

      <MobileOrderBookSummary
        onOpen={() => setOrderBookOpen(true)}
      />

      <MobileOrderStickyBar
        onOpen={() => setOrderBookOpen(true)}
      />

      <MobileOrderBookPanel
        open={orderBookOpen}
        onClose={() => setOrderBookOpen(false)}
      />
    </main>
  );
}

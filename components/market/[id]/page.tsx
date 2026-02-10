'use client';

import { useState } from 'react';
import MobilePriceChart from '@/components/market/MobilePriceChart';
import { OrderBookSummary, OrderBookPanel } from '@/components/market/OrderBook';

export default function MarketDetailPage() {
  const [obOpen, setObOpen] = useState(false);

  return (
    <main className="relative pb-32">
      <MobilePriceChart />
      <OrderBookSummary onOpen={() => setObOpen(true)} />
      <OrderBookPanel open={obOpen} onClose={() => setObOpen(false)} />
    </main>
  );
}

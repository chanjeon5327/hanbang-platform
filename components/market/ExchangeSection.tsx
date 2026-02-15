'use client';

import { useState, useEffect, useCallback } from 'react';
import OrderBookRealtime from '@/components/market/OrderBookRealtime';
import PriceChartBlock from '@/components/market/PriceChartBlock';
import PriceHeader from '@/components/market/PriceHeader';
import TradeHistoryRealtime from '@/components/market/TradeHistoryRealtime';
import PositionPanel from '@/components/market/PositionPanel';
import TradingPanelV2 from '@/components/market/TradingPanelV2';

type Props = {
  contentId: string;
  sharePriceUsd: number;
  fxRate: number;
  isLoggedIn: boolean;
  userId?: string | null;
  totalSupplyShares?: number | null;
  totalRaiseUsd?: number | null;
  currentRaiseUsd?: number | null;
  onToast?: (message: string) => void;
};

export default function ExchangeSection({
  contentId,
  sharePriceUsd,
  fxRate,
  isLoggedIn,
  userId,
  totalSupplyShares,
  totalRaiseUsd,
  currentRaiseUsd,
  onToast,
}: Props) {
  const [myOrderPrices, setMyOrderPrices] = useState<number[]>([]);
  const [lastTradePrice, setLastTradePrice] = useState<number | null>(null);
  const [prevTradePrice, setPrevTradePrice] = useState<number | null>(null);

  const handleTrade = useCallback((priceUsd: number) => {
    setLastTradePrice((prev) => {
      if (prev != null) setPrevTradePrice(prev);
      return priceUsd;
    });
  }, []);

  const fetchMyOrderbookOrders = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const res = await fetch(`/api/orders/orderbook/my?item_id=${contentId}`, { cache: 'no-store' });
      const j = await (res.ok ? res.json() : null);
      const orders = j?.orders ?? [];
      setMyOrderPrices(orders.map((o: { price_usd?: number }) => Number(o.price_usd ?? 0)).filter((p: number) => p > 0));
    } catch {
      setMyOrderPrices([]);
    }
  }, [contentId, isLoggedIn]);

  useEffect(() => {
    fetchMyOrderbookOrders();
  }, [fetchMyOrderbookOrders]);

  useEffect(() => {
    const onRefresh = () => {
      fetchMyOrderbookOrders();
    };
    window.addEventListener('invest-success', onRefresh);
    window.addEventListener('wallet-refresh', onRefresh);
    return () => {
      window.removeEventListener('invest-success', onRefresh);
      window.removeEventListener('wallet-refresh', onRefresh);
    };
  }, [fetchMyOrderbookOrders]);

  return (
    <div className="space-y-4">
      {/* 상단: 현재가 + 차트 고정 */}
      <div className="sticky top-14 z-10 bg-white rounded-xl border p-4" style={{ borderColor: 'var(--upbit-border)' }}>
        <PriceHeader
          sharePriceUsd={lastTradePrice ?? sharePriceUsd}
          fxRate={fxRate}
          prevCloseUsd={prevTradePrice ?? sharePriceUsd * 0.98}
          volume24h={null}
        />
        <PriceChartBlock
          sharePriceUsd={sharePriceUsd}
          totalRaiseUsd={totalRaiseUsd ?? null}
          currentRaiseUsd={currentRaiseUsd ?? null}
          fxRate={fxRate}
        />
      </div>

      {/* 좌우: 호가 | 주문+포지션 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 rounded-xl border p-4" style={{ borderColor: 'var(--upbit-border)' }}>
          <h3 className="text-[12px] font-semibold mb-3" style={{ color: 'var(--upbit-text-dim)' }}>
            호가
          </h3>
          <OrderBookRealtime
            contentId={contentId}
            currentPriceUsd={sharePriceUsd}
            myOrderPrices={myOrderPrices}
          />
        </div>
        <div className="lg:col-span-2 space-y-4">
          <div
            className="rounded-xl border p-4 md:relative md:min-h-0 max-md:sticky max-md:bottom-0 max-md:z-20 max-md:bg-white max-md:border-t max-md:rounded-t-xl max-md:pb-[env(safe-area-inset-bottom,0px)] max-md:shadow-[0_-4px_12px_rgba(0,0,0,0.06)]"
            style={{ borderColor: 'var(--upbit-border)' }}
          >
            <TradingPanelV2
              contentId={contentId}
              sharePriceUsd={sharePriceUsd}
              fxRate={fxRate}
              isLoggedIn={isLoggedIn}
              totalSupplyShares={totalSupplyShares}
              onToast={onToast}
              variant="order-only"
            />
          </div>
          <PositionPanel
            assetId={contentId}
            sharePriceUsd={sharePriceUsd}
            fxRate={fxRate}
            isLoggedIn={isLoggedIn}
          />
        </div>
      </div>

      {/* 하단: 체결내역 */}
      <div className="rounded-xl border p-4" style={{ borderColor: 'var(--upbit-border)' }}>
        <h3 className="text-[12px] font-semibold mb-3" style={{ color: 'var(--upbit-text-dim)' }}>
          체결내역
        </h3>
        <TradeHistoryRealtime contentId={contentId} onTrade={handleTrade} />
      </div>
    </div>
  );
}

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
  /** false면 주문/호가 비활성, empty state 표시 */
  isTradable?: boolean;
  isLoggedIn: boolean;
  userId?: string | null;
  totalSupplyShares?: number | null;
  totalRaiseUsd?: number | null;
  currentRaiseUsd?: number | null;
  volume24hKrw?: number | null;
  tradeCount24h?: number | null;
  onToast?: (message: string) => void;
};

export default function ExchangeSection({
  contentId,
  sharePriceUsd,
  fxRate,
  isTradable = true,
  isLoggedIn,
  userId,
  totalSupplyShares,
  totalRaiseUsd,
  currentRaiseUsd,
  volume24hKrw,
  tradeCount24h,
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
    <div className={!isTradable ? 'opacity-60' : ''} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      {isTradable && (
        <div
          className="flex items-center gap-1.5 py-1 px-2.5 rounded-full caption border"
          style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', width: 'fit-content', borderColor: 'var(--border)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--emerald)] animate-pulse" style={{ animationDuration: '1.5s' }} />
          실시간 시장 데이터
        </div>
      )}
      {!isTradable && (
        <div className="flex items-center gap-2 flex-wrap">
          <div
            className="flex items-center gap-1.5 py-1 px-2.5 rounded-full caption border"
            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', borderColor: 'var(--border)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--emerald)] animate-pulse" style={{ animationDuration: '1.5s' }} />
            실시간 시장 데이터
          </div>
          <span className="caption" style={{ color: 'var(--text-muted)' }}>지연 가능</span>
        </div>
      )}

      {/* 상단: 현재가 + 차트 (sticky: header 56px + tab ~48px = 104px) */}
      <div
        className="sticky z-10 rounded-[20px] p-4 shadow-sm"
        style={{
          top: '104px',
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <PriceHeader
          sharePriceUsd={lastTradePrice ?? sharePriceUsd}
          fxRate={fxRate}
          prevCloseUsd={prevTradePrice ?? sharePriceUsd * 0.98}
          volume24h={volume24hKrw ?? null}
          tradeCount24h={tradeCount24h ?? null}
        />
        <PriceChartBlock
          sharePriceUsd={sharePriceUsd}
          totalRaiseUsd={totalRaiseUsd ?? null}
          currentRaiseUsd={currentRaiseUsd ?? null}
          fxRate={fxRate}
        />
      </div>

      {/* 좌우: 호가 | 주문+포지션 (2열 grid gap 24px) */}
      <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: 'var(--space-lg)' }}>
        <div
          className="lg:col-span-1 rounded-[20px] p-4 shadow-sm"
          style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}
        >
          <h3 className="caption mb-3" style={{ color: 'var(--text-secondary)' }}>
            호가
          </h3>
          <OrderBookRealtime
            contentId={contentId}
            currentPriceUsd={sharePriceUsd}
            myOrderPrices={myOrderPrices}
            disabled={!isTradable}
          />
        </div>
        <div className="lg:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <div
            className="rounded-[20px] p-4 shadow-sm md:relative md:min-h-0 max-md:sticky max-md:bottom-0 max-md:z-20 max-md:pb-[env(safe-area-inset-bottom,0px)]"
            style={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <TradingPanelV2
              contentId={contentId}
              sharePriceUsd={sharePriceUsd}
              fxRate={fxRate}
              isLoggedIn={isLoggedIn}
              totalSupplyShares={totalSupplyShares}
              onToast={onToast}
              variant="order-only"
              disabled={!isTradable}
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
      <div
        className="rounded-[20px] p-4 shadow-sm"
        style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}
      >
        <h3 className="caption mb-3" style={{ color: 'var(--text-secondary)' }}>
          체결내역
        </h3>
        <TradeHistoryRealtime contentId={contentId} onTrade={handleTrade} disabled={!isTradable} />
      </div>
    </div>
  );
}

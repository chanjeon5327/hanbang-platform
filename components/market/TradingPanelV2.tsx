'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatKrw, formatRate, formatQty } from '@/lib/utils/format';
import Skeleton from '@/components/ui/Skeleton';

type OrderbookLevel = { price_usd: number; quantity: number };
type Trade = { id: string; price_usd: number; quantity: number; side: string; created_at: string };
type Position = {
  quantity: number;
  total_cost: number;
  avg_price: number;
  current_value?: number;
  unrealized_pnl?: number;
  unrealized_rate?: number;
};

type Props = {
  contentId: string;
  sharePriceUsd: number;
  fxRate: number;
  isLoggedIn: boolean;
  totalSupplyShares?: number | null;
  onToast?: (message: string) => void;
};

function formatUsd(n: number): string {
  return `$${n.toFixed(2)}`;
}

export default function TradingPanelV2({
  contentId,
  sharePriceUsd,
  fxRate,
  isLoggedIn,
  totalSupplyShares,
  onToast,
}: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'호가' | '주문' | '체결' | '포지션'>('호가');
  const [orderTab, setOrderTab] = useState<'지정가' | '시장가'>('지정가');
  const [bids, setBids] = useState<OrderbookLevel[]>([]);
  const [asks, setAsks] = useState<OrderbookLevel[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [position, setPosition] = useState<Position | null>(null);
  const [userCash, setUserCash] = useState<number>(0);
  const [orderSide, setOrderSide] = useState<'bid' | 'ask'>('bid');
  const [orderPrice, setOrderPrice] = useState(sharePriceUsd.toFixed(2));
  const [orderQty, setOrderQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderbookLoading, setOrderbookLoading] = useState(true);
  const [tradesLoading, setTradesLoading] = useState(true);
  const [positionLoading, setPositionLoading] = useState(false);

  const showToast = useCallback(
    (msg: string) => {
      onToast?.(msg);
    },
    [onToast]
  );

  const currentPriceKrw = useMemo(() => sharePriceUsd * fxRate, [sharePriceUsd, fxRate]);
  const totalAmountKrw = useMemo(
    () => (orderTab === '시장가' ? currentPriceKrw * orderQty : parseFloat(orderPrice || '0') * orderQty * fxRate),
    [orderTab, orderPrice, orderQty, fxRate, currentPriceKrw]
  );
  const insufficientFunds = useMemo(
    () => isLoggedIn && orderSide === 'bid' && userCash < totalAmountKrw,
    [isLoggedIn, orderSide, userCash, totalAmountKrw]
  );
  const insufficientAssets = useMemo(
    () => isLoggedIn && orderSide === 'ask' && (position?.quantity ?? 0) < orderQty,
    [isLoggedIn, orderSide, position?.quantity, orderQty]
  );

  const fetchOrderbook = useCallback(() => {
    setOrderbookLoading(true);
    fetch(`/api/market/orderbook/${contentId}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((j) => {
        setBids(j.bids ?? []);
        setAsks(j.asks ?? []);
      })
      .catch(() => {})
      .finally(() => setOrderbookLoading(false));
  }, [contentId]);

  const fetchTrades = useCallback(() => {
    setTradesLoading(true);
    fetch(`/api/market/trades/${contentId}?limit=20`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((j) => setTrades(j.trades ?? []))
      .catch(() => setTrades([]))
      .finally(() => setTradesLoading(false));
  }, [contentId]);

  const fetchPosition = useCallback(() => {
    if (!isLoggedIn) return;
    setPositionLoading(true);
    const priceKrw = Math.round(sharePriceUsd * fxRate);
    fetch(`/api/wallet/position?asset_id=${contentId}&current_price_krw=${priceKrw}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => (d?.quantity > 0 ? d : null))
      .then(setPosition)
      .catch(() => setPosition(null))
      .finally(() => setPositionLoading(false));
  }, [contentId, isLoggedIn, sharePriceUsd, fxRate]);

  const fetchUserCash = useCallback(() => {
    if (!isLoggedIn) return;
    fetch('/api/wallet/invest-summary', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setUserCash(d?.cashBalance ?? 0))
      .catch(() => setUserCash(0));
  }, [isLoggedIn]);

  useEffect(() => {
    fetchOrderbook();
    fetchTrades();
  }, [fetchOrderbook, fetchTrades]);

  useEffect(() => {
    fetchPosition();
    fetchUserCash();
  }, [fetchPosition, fetchUserCash]);

  useEffect(() => {
    const onRefresh = () => {
      fetchOrderbook();
      fetchTrades();
      fetchPosition();
      fetchUserCash();
    };
    window.addEventListener('invest-success', onRefresh);
    window.addEventListener('wallet-refresh', onRefresh);
    return () => {
      window.removeEventListener('invest-success', onRefresh);
      window.removeEventListener('wallet-refresh', onRefresh);
    };
  }, [fetchOrderbook, fetchTrades, fetchPosition, fetchUserCash]);

  useEffect(() => {
    setOrderPrice(sharePriceUsd.toFixed(2));
  }, [sharePriceUsd]);

  const handlePlaceOrder = useCallback(async () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    if (orderSide === 'bid' && insufficientFunds) {
      showToast('잔고가 부족합니다.');
      return;
    }
    if (orderSide === 'ask' && insufficientAssets) {
      showToast('보유 수량이 부족합니다.');
      return;
    }
    setLoading(true);
    try {
      if (orderSide === 'ask') {
        const res = await fetch('/api/orders/sell', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_id: contentId, content_id: contentId, quantity: orderQty }),
        });
        const json = await res.json();
        if (json?.success) {
          window.dispatchEvent(new Event('invest-success'));
          window.dispatchEvent(new Event('wallet-refresh'));
          setOrderQty(1);
          showToast('주문이 체결되었습니다.');
          fetchOrderbook();
          fetchTrades();
          fetchPosition();
          fetchUserCash();
        } else {
          showToast(json?.error === 'INSUFFICIENT_ASSETS' ? '보유 수량이 부족합니다.' : '주문에 실패했습니다.');
        }
      } else {
        const amount = Math.round(
          orderTab === '시장가' ? currentPriceKrw * orderQty : parseFloat(orderPrice || '0') * orderQty * fxRate
        );
        const res = await fetch('/api/orders/place', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_id: contentId, amount }),
        });
        const json = await res.json();
        if (json?.success) {
          window.dispatchEvent(new Event('invest-success'));
          window.dispatchEvent(new Event('wallet-refresh'));
          setOrderQty(1);
          showToast('주문이 체결되었습니다.');
          fetchOrderbook();
          fetchTrades();
          fetchPosition();
          fetchUserCash();
        } else {
          showToast(json?.error === 'INSUFFICIENT_FUNDS' ? '잔고가 부족합니다.' : '주문에 실패했습니다.');
        }
      }
    } catch {
      showToast('주문에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [
    isLoggedIn,
    orderSide,
    insufficientFunds,
    insufficientAssets,
    orderTab,
    orderPrice,
    orderQty,
    contentId,
    fxRate,
    currentPriceKrw,
    router,
    showToast,
    fetchOrderbook,
    fetchTrades,
    fetchPosition,
    fetchUserCash,
  ]);

  const maxBid = bids.length > 0 ? Math.max(...bids.map((b) => b.quantity)) : 1;
  const maxAsk = asks.length > 0 ? Math.max(...asks.map((a) => a.quantity)) : 1;
  const bestBid = bids[0]?.price_usd;
  const bestAsk = asks[0]?.price_usd;
  const holdRatio =
    position && totalSupplyShares != null && totalSupplyShares > 0
      ? (position.quantity / totalSupplyShares) * 100
      : null;

  const tabs = ['호가', '주문', '체결', '포지션'] as const;

  return (
    <div className="py-4" style={{ borderBottom: '1px solid var(--upbit-border)' }}>
      <style>{`
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
      <div className="flex gap-1 mb-4">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setActiveTab(t)}
            className="flex-1 py-2 text-[13px] font-semibold rounded-lg transition-opacity duration-150"
            style={{
              backgroundColor: activeTab === t ? 'var(--primary)' : 'transparent',
              color: activeTab === t ? '#fff' : 'var(--upbit-text-dim)',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {activeTab === '호가' && (
        <div className="grid grid-cols-2 gap-4 animate-[fadeIn_0.15s_ease-out]">
          {orderbookLoading ? (
            <>
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </>
          ) : (
            <>
              <div>
                <div className="text-[11px] mb-1" style={{ color: 'var(--upbit-text-dim)' }}>매수 호가</div>
                <div className="space-y-0.5">
                  {bids.slice(0, 5).map((b, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center text-[13px] relative py-0.5"
                      style={{
                        backgroundColor: bestBid === b.price_usd ? 'rgba(30,136,229,0.12)' : undefined,
                      }}
                    >
                      <div
                        className="absolute left-0 top-0 bottom-0 rounded-r opacity-15"
                        style={{
                          width: `${(b.quantity / maxBid) * 100}%`,
                          backgroundColor: 'var(--upbit-bid)',
                        }}
                      />
                      <span className="font-semibold tabular-nums relative z-10" style={{ color: 'var(--upbit-bid)' }}>
                        {formatUsd(b.price_usd)}
                      </span>
                      <span className="tabular-nums relative z-10" style={{ color: 'var(--upbit-text-dim)' }}>
                        {formatQty(b.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[11px] mb-1" style={{ color: 'var(--upbit-text-dim)' }}>매도 호가</div>
                <div className="space-y-0.5">
                  {asks.slice(0, 5).map((a, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center text-[13px] relative py-0.5"
                      style={{
                        backgroundColor: bestAsk === a.price_usd ? 'rgba(229,57,53,0.12)' : undefined,
                      }}
                    >
                      <div
                        className="absolute right-0 top-0 bottom-0 rounded-l opacity-15"
                        style={{
                          width: `${(a.quantity / maxAsk) * 100}%`,
                          backgroundColor: 'var(--upbit-ask)',
                          right: 0,
                          left: 'auto',
                        }}
                      />
                      <span className="font-semibold tabular-nums relative z-10" style={{ color: 'var(--upbit-ask)' }}>
                        {formatUsd(a.price_usd)}
                      </span>
                      <span className="tabular-nums relative z-10" style={{ color: 'var(--upbit-text-dim)' }}>
                        {formatQty(a.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === '주문' && (
        <div className="space-y-3 animate-[fadeIn_0.15s_ease-out]">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setOrderTab('지정가')}
              disabled={loading}
              className="flex-1 py-2 text-[13px] font-semibold rounded-lg transition disabled:opacity-50"
              style={{
                backgroundColor: orderTab === '지정가' ? 'var(--primary)' : 'rgba(0,0,0,0.06)',
                color: orderTab === '지정가' ? '#fff' : 'var(--upbit-text)',
              }}
            >
              지정가
            </button>
            <button
              type="button"
              onClick={() => setOrderTab('시장가')}
              disabled={loading}
              className="flex-1 py-2 text-[13px] font-semibold rounded-lg transition disabled:opacity-50"
              style={{
                backgroundColor: orderTab === '시장가' ? 'var(--primary)' : 'rgba(0,0,0,0.06)',
                color: orderTab === '시장가' ? '#fff' : 'var(--upbit-text)',
              }}
            >
              시장가
            </button>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setOrderSide('bid')}
              disabled={loading}
              className="flex-1 py-2 text-[13px] font-semibold rounded-lg transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
              style={{
                backgroundColor: orderSide === 'bid' ? 'var(--upbit-bid)' : 'rgba(0,0,0,0.06)',
                color: orderSide === 'bid' ? '#fff' : 'var(--upbit-text)',
              }}
            >
              매수
            </button>
            <button
              type="button"
              onClick={() => setOrderSide('ask')}
              disabled={loading}
              className="flex-1 py-2 text-[13px] font-semibold rounded-lg transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
              style={{
                backgroundColor: orderSide === 'ask' ? 'var(--upbit-ask)' : 'rgba(0,0,0,0.06)',
                color: orderSide === 'ask' ? '#fff' : 'var(--upbit-text)',
              }}
            >
              매도
            </button>
          </div>
          {orderTab === '지정가' && (
            <div>
              <label className="text-[12px] block mb-1" style={{ color: 'var(--upbit-text-dim)' }}>가격 (USD)</label>
              <input
                type="text"
                inputMode="decimal"
                value={orderPrice}
                onChange={(e) => setOrderPrice(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 rounded-lg border text-[14px] tabular-nums disabled:opacity-60"
                style={{
                  backgroundColor: 'var(--upbit-bg)',
                  borderColor: 'var(--upbit-border)',
                  color: 'var(--upbit-text)',
                }}
              />
            </div>
          )}
          {orderTab === '시장가' && (
            <div className="text-[13px]" style={{ color: 'var(--upbit-text-dim)' }}>
              시장가: {formatUsd(sharePriceUsd)} ({formatKrw(sharePriceUsd * fxRate)})
            </div>
          )}
          <div>
            <label className="text-[12px] block mb-1" style={{ color: 'var(--upbit-text-dim)' }}>수량</label>
            <input
              type="number"
              min={1}
              value={orderQty}
              onChange={(e) => setOrderQty(Math.max(1, Number(e.target.value) || 0))}
              disabled={loading}
              className="w-full px-3 py-2 rounded-lg border text-[14px] tabular-nums disabled:opacity-60"
              style={{
                backgroundColor: 'var(--upbit-bg)',
                borderColor: 'var(--upbit-border)',
                color: 'var(--upbit-text)',
              }}
            />
          </div>
          <div className="flex justify-between text-[13px]">
            <span style={{ color: 'var(--upbit-text-dim)' }}>총액</span>
            <span className="font-semibold tabular-nums" style={{ color: 'var(--upbit-text)' }}>
              {formatKrw(totalAmountKrw)}
            </span>
          </div>
          {isLoggedIn && (
            <div className="text-[11px]" style={{ color: 'var(--upbit-text-dim)' }}>
              예수금 {formatKrw(userCash)}
            </div>
          )}
          {insufficientFunds && (
            <p className="text-[12px]" style={{ color: 'var(--upbit-ask)' }}>
              예수금이 부족합니다.
            </p>
          )}
          {insufficientAssets && (
            <p className="text-[12px]" style={{ color: 'var(--upbit-ask)' }}>
              보유 수량이 부족합니다.
            </p>
          )}
          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={loading || !isLoggedIn || insufficientFunds || insufficientAssets}
            className="w-full py-3 rounded-lg text-[15px] font-bold transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 disabled:hover:opacity-50"
            style={{
              backgroundColor: orderSide === 'bid' ? 'var(--upbit-bid)' : 'var(--upbit-ask)',
              color: '#fff',
              border: insufficientFunds || insufficientAssets ? '2px solid var(--upbit-ask)' : 'none',
            }}
          >
            {!isLoggedIn ? '로그인 후 주문' : insufficientFunds ? '잔고 부족' : insufficientAssets ? '보유 부족' : loading ? '처리 중…' : orderSide === 'bid' ? '매수하기' : '매도하기'}
          </button>
        </div>
      )}

      {activeTab === '체결' && (
        <div className="space-y-1 max-h-[200px] overflow-y-auto animate-[fadeIn_0.15s_ease-out]">
          {tradesLoading ? (
            <div className="py-4 space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : trades.length === 0 ? (
            <p className="text-[13px] py-8 text-center" style={{ color: 'var(--upbit-text-dim)' }}>
              아직 체결 내역이 없습니다.
            </p>
          ) : (
            trades.map((t) => (
              <div
                key={t.id}
                className="flex justify-between py-2 text-[13px] animate-[fadeIn_0.2s_ease-out]"
                style={{ borderBottom: '1px solid var(--upbit-border)' }}
              >
                <span
                  className="tabular-nums font-semibold"
                  style={{
                    color: t.side === 'buy' ? 'var(--upbit-bid)' : 'var(--upbit-ask)',
                  }}
                >
                  {t.side === 'buy' ? '▲' : '▼'} {formatUsd(t.price_usd)}
                </span>
                <span className="tabular-nums" style={{ color: 'var(--upbit-text-dim)' }}>
                  {formatQty(t.quantity)}
                </span>
                <span className="text-[11px]" style={{ color: 'var(--upbit-text-dim)' }}>
                  {new Date(t.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === '포지션' && (
        <div className="space-y-3 animate-[fadeIn_0.15s_ease-out]">
          {!isLoggedIn ? (
            <p className="text-[13px] py-8 text-center" style={{ color: 'var(--upbit-text-dim)' }}>
              <Link href="/login" className="font-semibold" style={{ color: 'var(--upbit-bid)' }}>
                로그인
              </Link>
              후 포지션을 확인하세요
            </p>
          ) : positionLoading ? (
            <div className="py-4 space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !position || position.quantity <= 0 ? (
            <p className="text-[13px] py-8 text-center" style={{ color: 'var(--upbit-text-dim)' }}>
              보유 자산이 없습니다.
            </p>
          ) : (
            <div className="space-y-2 text-[13px]">
              <div className="flex justify-between">
                <span style={{ color: 'var(--upbit-text-dim)' }}>보유수량</span>
                <span className="font-semibold tabular-nums" style={{ color: 'var(--upbit-text)' }}>
                  {formatQty(position.quantity)}주
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--upbit-text-dim)' }}>평균매입가</span>
                <span className="font-semibold tabular-nums" style={{ color: 'var(--upbit-text)' }}>
                  {formatKrw(position.avg_price)}
                </span>
              </div>
              {holdRatio != null && (
                <div className="flex justify-between">
                  <span style={{ color: 'var(--upbit-text-dim)' }}>보유 비율</span>
                  <span className="font-semibold tabular-nums" style={{ color: 'var(--upbit-text)' }}>
                    {formatRate(holdRatio)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span style={{ color: 'var(--upbit-text-dim)' }}>평가금액</span>
                <span className="font-semibold tabular-nums" style={{ color: 'var(--upbit-text)' }}>
                  {formatKrw(position.current_value ?? sharePriceUsd * fxRate * position.quantity)}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--upbit-text-dim)' }}>평가손익</span>
                <span
                  className="font-extrabold tabular-nums"
                  style={{
                    color:
                      (position.unrealized_pnl ?? sharePriceUsd * fxRate * position.quantity - position.total_cost) >= 0
                        ? 'var(--upbit-positive)'
                        : 'var(--upbit-ask)',
                  }}
                >
                  {(() => {
                    const pnl = position.unrealized_pnl ?? sharePriceUsd * fxRate * position.quantity - position.total_cost;
                    return (pnl >= 0 ? '+' : '') + formatKrw(pnl);
                  })()}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--upbit-text-dim)' }}>수익률</span>
                <span
                  className="font-extrabold tabular-nums"
                  style={{
                    color:
                      (position.unrealized_rate ?? 0) >= 0
                        ? 'var(--upbit-positive)'
                        : 'var(--upbit-ask)',
                  }}
                >
                  {position.unrealized_rate != null ? formatRate(position.unrealized_rate) : (position.avg_price > 0 ? formatRate(((sharePriceUsd * fxRate - position.avg_price) / position.avg_price) * 100) : '-')}
                </span>
              </div>
              <Link
                href="/wallet"
                className="block mt-3 py-2 text-center text-[13px] font-semibold rounded-lg border transition active:scale-[0.98]"
                style={{ borderColor: 'var(--upbit-border)', color: 'var(--upbit-bid)' }}
              >
                지갑에서 자세히 보기
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

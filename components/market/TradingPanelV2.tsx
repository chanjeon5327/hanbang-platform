'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatKrw, formatRate, formatQty } from '@/lib/utils/format';
import Skeleton from '@/components/ui/Skeleton';
import MetricRow from '@/components/ui/MetricRow';

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
  /** 'order-only': 호가/체결/내주문/포지션 탭 숨김, 주문 폼만 표시 (거래소 레이아웃용) */
  variant?: 'full' | 'order-only';
  /** true면 입력/버튼 비활성 + 안내 메시지 */
  disabled?: boolean;
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
  variant = 'full',
  disabled = false,
}: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'호가' | '주문' | '체결' | '내주문' | '포지션'>('호가');
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
  const [myOrders, setMyOrders] = useState<{ id: string; type: string; price: number; quantity: number; executed_quantity: number; status: string | null; created_at: string }[]>([]);
  const [myOrdersLoading, setMyOrdersLoading] = useState(false);
  const [positionLoading, setPositionLoading] = useState(false);
  const [lockBusyRetrying, setLockBusyRetrying] = useState(false);
  const [matchResultFlash, setMatchResultFlash] = useState(false);

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
    fetch(`/api/orders/book?item_id=${contentId}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((j) => {
        setBids(j.bids ?? []);
        setAsks(j.asks ?? []);
      })
      .catch(() => {})
      .finally(() => setOrderbookLoading(false));
  }, [contentId]);

  const fetchMyOrders = useCallback(() => {
    if (!isLoggedIn) return;
    setMyOrdersLoading(true);
    fetch(`/api/orders/my?item_id=${contentId}&limit=20`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => setMyOrders(j?.orders ?? []))
      .catch(() => setMyOrders([]))
      .finally(() => setMyOrdersLoading(false));
  }, [contentId, isLoggedIn]);

  const fetchTrades = useCallback(() => {
    setTradesLoading(true);
    fetch(`/api/orders/trades?item_id=${contentId}&limit=20`, { cache: 'no-store' })
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
    const iv = setInterval(() => {
      fetchOrderbook();
      fetchTrades();
    }, 5000);
    return () => clearInterval(iv);
  }, [fetchOrderbook, fetchTrades]);

  useEffect(() => {
    fetchPosition();
    fetchUserCash();
  }, [fetchPosition, fetchUserCash]);

  useEffect(() => {
    fetchMyOrders();
  }, [fetchMyOrders]);

  useEffect(() => {
    const onRefresh = () => {
      fetchOrderbook();
      fetchTrades();
      fetchMyOrders();
      fetchPosition();
      fetchUserCash();
    };
    window.addEventListener('invest-success', onRefresh);
    window.addEventListener('wallet-refresh', onRefresh);
    return () => {
      window.removeEventListener('invest-success', onRefresh);
      window.removeEventListener('wallet-refresh', onRefresh);
    };
  }, [fetchOrderbook, fetchTrades, fetchMyOrders, fetchPosition, fetchUserCash]);

  useEffect(() => {
    setOrderPrice(sharePriceUsd.toFixed(2));
  }, [sharePriceUsd]);

  const handlePlaceOrder = useCallback(async () => {
    if (disabled) return;
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
    setLockBusyRetrying(false);
    const idempotencyKey = crypto.randomUUID();
    try {
      if (orderTab === '지정가') {
        const res = await fetch('/api/orders/orderbook/place', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            item_id: contentId,
            content_id: contentId,
            side: orderSide,
            price_usd: parseFloat(orderPrice || '0'),
            quantity: orderQty,
            price_krw: Math.round(parseFloat(orderPrice || '0') * fxRate),
            idempotency_key: idempotencyKey,
          }),
        });
        const json = await res.json();
        if (res.status === 409 && json?.code === 'LOCK_BUSY') {
          setLockBusyRetrying(true);
          showToast('잠시 후 다시 시도해 주세요.');
          return;
        }
        if (json?.success) {
          const matchedCount = json?.matched_count ?? 0;
          if (matchedCount > 0) {
            setMatchResultFlash(true);
            setTimeout(() => setMatchResultFlash(false), 500);
            showToast(`${matchedCount}건 체결되었습니다.`);
          } else {
            showToast('주문이 접수되었습니다.');
          }
          window.dispatchEvent(new Event('invest-success'));
          window.dispatchEvent(new Event('wallet-refresh'));
          setOrderQty(1);
          fetchOrderbook();
          fetchTrades();
          fetchMyOrders();
          fetchPosition();
          fetchUserCash();
        } else {
          showToast(json?.error === 'INSUFFICIENT_FUNDS' ? '잔고가 부족합니다.' : json?.error === 'INSUFFICIENT_ASSETS' ? '보유 수량이 부족합니다.' : json?.error ?? '주문에 실패했습니다.');
        }
      } else if (orderSide === 'ask') {
        const res = await fetch('/api/orders/sell', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_id: contentId,
            content_id: contentId,
            quantity: orderQty,
            idempotency_key: idempotencyKey,
          }),
        });
        const json = await res.json();
        if (res.status === 409 && json?.code === 'LOCK_BUSY') {
          setLockBusyRetrying(true);
          showToast('잠시 후 다시 시도해 주세요.');
          return;
        }
        if (json?.success) {
          window.dispatchEvent(new Event('invest-success'));
          window.dispatchEvent(new Event('wallet-refresh'));
          setOrderQty(1);
          showToast('주문이 체결되었습니다.');
          fetchOrderbook();
          fetchTrades();
          fetchMyOrders();
          fetchPosition();
          fetchUserCash();
        } else {
          showToast(json?.error === 'INSUFFICIENT_ASSETS' ? '보유 수량이 부족합니다.' : json?.code === 'LOCK_BUSY' ? '잠시 후 다시 시도해 주세요.' : '주문에 실패했습니다.');
        }
      } else {
        const amount = Math.round(currentPriceKrw * orderQty);
        const res = await fetch('/api/orders/place', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_id: contentId,
            content_id: contentId,
            amount,
            idempotency_key: idempotencyKey,
          }),
        });
        const json = await res.json();
        if (res.status === 409 && json?.code === 'LOCK_BUSY') {
          setLockBusyRetrying(true);
          showToast('잠시 후 다시 시도해 주세요.');
          return;
        }
        if (json?.success) {
          window.dispatchEvent(new Event('invest-success'));
          window.dispatchEvent(new Event('wallet-refresh'));
          setOrderQty(1);
          showToast('주문이 체결되었습니다.');
          fetchOrderbook();
          fetchTrades();
          fetchMyOrders();
          fetchPosition();
          fetchUserCash();
        } else {
          showToast(json?.error === 'INSUFFICIENT_FUNDS' ? '잔고가 부족합니다.' : json?.code === 'LOCK_BUSY' ? '잠시 후 다시 시도해 주세요.' : '주문에 실패했습니다.');
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
    fetchMyOrders,
    fetchPosition,
    fetchUserCash,
    disabled,
  ]);

  const maxBid = bids.length > 0 ? Math.max(...bids.map((b) => b.quantity)) : 1;
  const maxAsk = asks.length > 0 ? Math.max(...asks.map((a) => a.quantity)) : 1;
  const bestBid = bids[0]?.price_usd;
  const bestAsk = asks[0]?.price_usd;
  const holdRatio =
    position && totalSupplyShares != null && totalSupplyShares > 0
      ? (position.quantity / totalSupplyShares) * 100
      : null;

  const tabs = ['호가', '주문', '체결', '내주문', '포지션'] as const;
  const showTabs = variant === 'full';

  return (
    <div className="py-4" style={{ borderBottom: showTabs ? '1px solid var(--border)' : 'none' }}>
      <style>{`
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
      {showTabs && (
      <div className="flex gap-1 mb-4">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setActiveTab(t)}
            className="flex-1 py-2 body-sm font-semibold rounded-xl transition-opacity duration-150"
            style={{
              backgroundColor: activeTab === t ? 'var(--royal-blue)' : 'transparent',
              color: activeTab === t ? '#fff' : 'var(--text-secondary)',
            }}
          >
            {t}
          </button>
        ))}
      </div>
      )}

      {(showTabs ? activeTab === '호가' : false) && (
        <div className="grid grid-cols-2 gap-4 animate-[fadeIn_0.15s_ease-out]">
          {orderbookLoading ? (
            <>
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </>
          ) : (
            <>
              <div>
                <div className="caption mb-1" style={{ color: 'var(--text-secondary)' }}>매수 호가</div>
                <div className="space-y-0.5">
                  {bids.slice(0, 5).map((b, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-[60%_40%] items-center body-sm relative py-0.5"
                        style={{
                          backgroundColor: bestBid === b.price_usd ? 'rgba(5,150,105,0.08)' : undefined,
                        }}
                    >
                      <div
                        className="absolute left-0 top-0 bottom-0 rounded-r opacity-15"
                        style={{
                          width: `${(b.quantity / maxBid) * 100}%`,
                          backgroundColor: 'var(--emerald)',
                        }}
                      />
                      <span className="font-semibold tabular-nums text-right relative z-10" style={{ color: 'var(--emerald)' }}>
                        {formatUsd(b.price_usd)}
                      </span>
                      <span className="tabular-nums text-right relative z-10" style={{ color: 'var(--text-secondary)' }}>
                        {formatQty(b.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="caption mb-1" style={{ color: 'var(--text-secondary)' }}>매도 호가</div>
                <div className="space-y-0.5">
                  {asks.slice(0, 5).map((a, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-[60%_40%] items-center body-sm relative py-0.5"
                        style={{
                          backgroundColor: bestAsk === a.price_usd ? 'rgba(220,38,38,0.08)' : undefined,
                        }}
                    >
                      <div
                        className="absolute right-0 top-0 bottom-0 rounded-l opacity-15"
                        style={{
                          width: `${(a.quantity / maxAsk) * 100}%`,
                          backgroundColor: 'var(--accent-loss)',
                          right: 0,
                          left: 'auto',
                        }}
                      />
                      <span className="font-semibold tabular-nums text-right relative z-10" style={{ color: 'var(--accent-loss)' }}>
                        {formatUsd(a.price_usd)}
                      </span>
                      <span className="tabular-nums text-right relative z-10" style={{ color: 'var(--text-secondary)' }}>
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

      {(showTabs ? activeTab === '주문' : true) && (
        <div className="space-y-3 animate-[fadeIn_0.15s_ease-out] relative">
          {disabled && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg" style={{ minHeight: 100, backgroundColor: 'var(--bg-secondary)' }}>
              <p className="caption text-center px-4" style={{ color: 'var(--text-secondary)' }}>
                현재는 거래가 준비 중이에요.
              </p>
            </div>
          )}
          <MetricRow
            items={[
              { label: '예상 체결가', value: formatKrw(orderTab === '시장가' ? currentPriceKrw : parseFloat(orderPrice || '0') * fxRate) },
              { label: '수수료', value: '—' },
              { label: '체결가능', value: orderSide === 'bid' ? `${Math.floor(userCash / (orderTab === '시장가' ? currentPriceKrw : parseFloat(orderPrice || '0') * fxRate) || 1)}주` : `${position?.quantity ?? 0}주` },
            ]}
            columns={2}
            dense
            compact
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setOrderTab('지정가')}
              disabled={loading || disabled}
              className="flex-1 py-2 body-sm font-semibold rounded-xl transition-all duration-200 ease-out disabled:opacity-50"
              style={{
                backgroundColor: orderTab === '지정가' ? 'var(--royal-blue)' : 'var(--bg-secondary)',
                color: orderTab === '지정가' ? '#fff' : 'var(--text)',
              }}
            >
              지정가
            </button>
            <button
              type="button"
              onClick={() => setOrderTab('시장가')}
              disabled={loading || disabled}
              className="flex-1 py-2 body-sm font-semibold rounded-xl transition-all duration-200 ease-out disabled:opacity-50"
              style={{
                backgroundColor: orderTab === '시장가' ? 'var(--royal-blue)' : 'var(--bg-secondary)',
                color: orderTab === '시장가' ? '#fff' : 'var(--text)',
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
              className="flex-1 py-2 body-sm font-semibold rounded-xl transition hover:opacity-90 disabled:opacity-50"
              style={{
                backgroundColor: orderSide === 'bid' ? 'var(--emerald)' : 'var(--bg-secondary)',
                color: orderSide === 'bid' ? '#fff' : 'var(--text)',
              }}
            >
              매수
            </button>
            <button
              type="button"
              onClick={() => setOrderSide('ask')}
              disabled={loading}
              className="flex-1 py-2 body-sm font-semibold rounded-xl transition hover:opacity-90 disabled:opacity-50"
              style={{
                backgroundColor: orderSide === 'ask' ? 'var(--accent-loss)' : 'var(--bg-secondary)',
                color: orderSide === 'ask' ? '#fff' : 'var(--text)',
              }}
            >
              매도
            </button>
          </div>
          {orderTab === '지정가' && (
            <div className="animate-[fadeIn_0.2s_ease-out]">
              <label className="caption block mb-1" style={{ color: 'var(--text-secondary)' }}>가격 (USD)</label>
              <input
                type="text"
                inputMode="decimal"
                value={orderPrice}
                onChange={(e) => setOrderPrice(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 rounded-xl border body-sm tabular-nums disabled:opacity-60 focus:ring-2 focus:ring-[var(--royal-blue)]/40 focus:outline-none"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border)',
                  color: 'var(--text)',
                }}
              />
            </div>
          )}
          {orderTab === '시장가' && (
            <div className="caption metric-number animate-[fadeIn_0.2s_ease-out]" style={{ color: 'var(--text-secondary)' }}>
              {formatUsd(sharePriceUsd)} ({formatKrw(sharePriceUsd * fxRate)})
            </div>
          )}
          <div>
            <label className="caption block mb-1" style={{ color: 'var(--text-secondary)' }}>수량</label>
            <input
              type="number"
              min={1}
              value={orderQty}
              onChange={(e) => setOrderQty(Math.max(1, Number(e.target.value) || 0))}
              disabled={loading}
              className="w-full px-3 py-2 rounded-xl border body-sm tabular-nums disabled:opacity-60 focus:ring-2 focus:ring-[var(--royal-blue)]/40 focus:outline-none"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border)',
                color: 'var(--text)',
              }}
            />
          </div>
          <div className="flex justify-between body-sm">
            <span style={{ color: 'var(--text-secondary)' }}>총액</span>
            <span className="font-semibold tabular-nums text-right" style={{ color: 'var(--text)' }}>
              {formatKrw(totalAmountKrw)}
            </span>
          </div>
          {insufficientFunds && (
            <p className="caption" style={{ color: 'var(--accent-loss)' }}>예수금 부족</p>
          )}
          {insufficientAssets && (
            <p className="caption" style={{ color: 'var(--accent-loss)' }}>보유 부족</p>
          )}
          {lockBusyRetrying && (
            <p className="caption" style={{ color: 'var(--accent-loss)' }}>잠시 후 재시도</p>
          )}
          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={loading || disabled || !isLoggedIn || insufficientFunds || insufficientAssets}
            className={`w-full py-3 rounded-xl body font-bold transition-opacity duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed ${matchResultFlash ? 'ring-2 ring-green-400 ring-offset-2' : ''}`}
            style={{
              backgroundColor: orderSide === 'bid' ? 'var(--emerald)' : 'var(--accent-loss)',
              color: '#fff',
              border: insufficientFunds || insufficientAssets ? '1px solid var(--accent-loss)' : 'none',
            }}
          >
            {disabled ? '거래 준비 중' : !isLoggedIn ? '로그인 후 주문' : insufficientFunds ? '잔고 부족' : insufficientAssets ? '보유 부족' : loading ? '처리 중…' : orderSide === 'bid' ? '매수하기' : '매도하기'}
          </button>
        </div>
      )}

      {showTabs && activeTab === '체결' && (
        <div className="space-y-1 max-h-[200px] overflow-y-auto animate-[fadeIn_0.15s_ease-out]">
          {tradesLoading ? (
            <div className="py-4 space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : trades.length === 0 ? (
            <p className="body-sm py-8 text-center" style={{ color: 'var(--text-secondary)' }}>
              아직 체결 내역이 없습니다.
            </p>
          ) : (
            trades.map((t) => (
              <div
                key={t.id}
                className="flex justify-between py-2 body-sm animate-[fadeIn_0.2s_ease-out]"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <span
                  className="tabular-nums font-semibold text-right"
                  style={{
                    color: t.side === 'buy' ? 'var(--emerald)' : 'var(--accent-loss)',
                  }}
                >
                  {t.side === 'buy' ? '▲' : '▼'} {formatUsd(t.price_usd)}
                </span>
                <span className="tabular-nums text-right" style={{ color: 'var(--text-secondary)' }}>
                  {formatQty(t.quantity)}
                </span>
                <span className="caption tabular-nums text-right" style={{ color: 'var(--text-secondary)' }}>
                  {new Date(t.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {showTabs && activeTab === '내주문' && (
        <div className="space-y-1 max-h-[200px] overflow-y-auto animate-[fadeIn_0.15s_ease-out]">
          {!isLoggedIn ? (
            <p className="body-sm py-8 text-center" style={{ color: 'var(--text-secondary)' }}>
              <Link href="/login" className="font-semibold" style={{ color: 'var(--emerald)' }}>로그인</Link> 후 주문 내역을 확인하세요
            </p>
          ) : myOrdersLoading ? (
            <div className="py-4 space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : myOrders.length === 0 ? (
            <p className="body-sm py-8 text-center" style={{ color: 'var(--text-secondary)' }}>주문 내역이 없습니다.</p>
          ) : (
            myOrders.map((o) => (
              <div
                key={o.id}
                className="flex justify-between py-2 body-sm"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <span className="font-semibold tabular-nums text-right" style={{ color: o.type === 'BUY' ? 'var(--emerald)' : 'var(--accent-loss)' }}>
                  {o.type === 'BUY' ? '매수' : '매도'} {formatKrw(o.price)}
                </span>
                <span className="tabular-nums text-right" style={{ color: 'var(--text-secondary)' }}>
                  {o.executed_quantity}/{o.quantity}
                </span>
                <span className="caption tabular-nums text-right" style={{ color: 'var(--text-secondary)' }}>
                  {new Date(o.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {showTabs && activeTab === '포지션' && (
        <div className="space-y-3 animate-[fadeIn_0.15s_ease-out]">
          {!isLoggedIn ? (
            <p className="body-sm py-8 text-center" style={{ color: 'var(--text-secondary)' }}>
              <Link href="/login" className="font-semibold" style={{ color: 'var(--emerald)' }}>
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
            <p className="body-sm py-8 text-center" style={{ color: 'var(--text-secondary)' }}>
              보유 자산이 없습니다.
            </p>
          ) : (
            <div className="space-y-2 body-sm">
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>보유수량</span>
                <span className="font-semibold tabular-nums text-right" style={{ color: 'var(--text)' }}>
                  {formatQty(position.quantity)}주
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>평균매입가</span>
                <span className="font-semibold tabular-nums text-right" style={{ color: 'var(--text)' }}>
                  {formatKrw(position.avg_price)}
                </span>
              </div>
              {holdRatio != null && (
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>보유 비율</span>
                  <span className="font-semibold tabular-nums text-right" style={{ color: 'var(--text)' }}>
                    {formatRate(holdRatio)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>평가금액</span>
                <span className="font-semibold tabular-nums text-right" style={{ color: 'var(--text)' }}>
                  {formatKrw(position.current_value ?? sharePriceUsd * fxRate * position.quantity)}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>평가손익</span>
                <span
                  className="font-extrabold tabular-nums text-right"
                  style={{
                    color:
                      (position.unrealized_pnl ?? sharePriceUsd * fxRate * position.quantity - position.total_cost) >= 0
                        ? 'var(--emerald)'
                        : 'var(--accent-loss)',
                  }}
                >
                  {(() => {
                    const pnl = position.unrealized_pnl ?? sharePriceUsd * fxRate * position.quantity - position.total_cost;
                    return (pnl >= 0 ? '+' : '') + formatKrw(pnl);
                  })()}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>수익률</span>
                <span
                  className="font-extrabold tabular-nums text-right"
                  style={{
                    color:
                      (position.unrealized_rate ?? 0) >= 0
                        ? 'var(--emerald)'
                        : 'var(--accent-loss)',
                  }}
                >
                  {position.unrealized_rate != null ? formatRate(position.unrealized_rate) : (position.avg_price > 0 ? formatRate(((sharePriceUsd * fxRate - position.avg_price) / position.avg_price) * 100) : '-')}
                </span>
              </div>
              <Link
                href="/wallet"
                className="block py-2 text-center body-sm font-semibold rounded-xl border transition hover:opacity-90"
                style={{ borderColor: 'var(--border)', color: 'var(--emerald)', marginTop: 'var(--space-md)' }}
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

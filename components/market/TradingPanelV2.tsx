'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type OrderbookLevel = { price_usd: number; quantity: number };
type Trade = { id: string; price_usd: number; quantity: number; side: string; created_at: string };

type Props = {
  contentId: string;
  sharePriceUsd: number;
  fxRate: number;
  isLoggedIn: boolean;
};

function formatUsd(n: number): string {
  return `$${n.toFixed(2)}`;
}

function formatKrw(n: number, fx: number): string {
  return `₩${Math.round(n * fx).toLocaleString()}`;
}

export default function TradingPanelV2({ contentId, sharePriceUsd, fxRate, isLoggedIn }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'호가' | '주문' | '체결' | '내주문'>('호가');
  const [bids, setBids] = useState<OrderbookLevel[]>([]);
  const [asks, setAsks] = useState<OrderbookLevel[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [orderSide, setOrderSide] = useState<'bid' | 'ask'>('bid');
  const [orderPrice, setOrderPrice] = useState(sharePriceUsd.toFixed(2));
  const [orderQty, setOrderQty] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/market/orderbook/${contentId}`)
      .then((r) => r.json())
      .then((j) => {
        setBids(j.bids ?? []);
        setAsks(j.asks ?? []);
      })
      .catch(() => {});
  }, [contentId]);

  useEffect(() => {
    fetch(`/api/market/trades/${contentId}?limit=20`)
      .then((r) => r.json())
      .then((j) => setTrades(j.trades ?? []))
      .catch(() => {});
  }, [contentId]);

  const handlePlaceOrder = async () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    setLoading(true);
    try {
      const amount = Math.round(parseFloat(orderPrice) * orderQty * fxRate);
      const res = await fetch('/api/orders/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: contentId, amount }),
      });
      const json = await res.json();
      if (json?.success) {
        alert('주문 접수됨');
        setOrderQty(1);
      } else {
        alert(json?.error === 'INSUFFICIENT_FUNDS' ? '잔액 부족' : '주문 실패');
      }
    } catch {
      alert('주문 실패');
    } finally {
      setLoading(false);
    }
  };

  const tabs = ['호가', '주문', '체결', '내주문'] as const;

  return (
    <div className="py-4" style={{ borderBottom: '1px solid var(--upbit-border)' }}>
      <div className="flex gap-1 mb-4">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setActiveTab(t)}
            className="flex-1 py-2 text-[13px] font-semibold rounded-lg transition"
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-[11px] mb-1" style={{ color: 'var(--upbit-text-dim)' }}>매수 호가</div>
            <div className="space-y-0.5">
              {bids.slice(0, 5).map((b, i) => (
                <div key={i} className="flex justify-between text-[13px]">
                  <span className="font-semibold tabular-nums" style={{ color: 'var(--upbit-bid)' }}>{formatUsd(b.price_usd)}</span>
                  <span className="tabular-nums" style={{ color: 'var(--upbit-text-dim)' }}>{b.quantity}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[11px] mb-1" style={{ color: 'var(--upbit-text-dim)' }}>매도 호가</div>
            <div className="space-y-0.5">
              {asks.slice(0, 5).map((a, i) => (
                <div key={i} className="flex justify-between text-[13px]">
                  <span className="font-semibold tabular-nums" style={{ color: 'var(--upbit-ask)' }}>{formatUsd(a.price_usd)}</span>
                  <span className="tabular-nums" style={{ color: 'var(--upbit-text-dim)' }}>{a.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === '주문' && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setOrderSide('bid')}
              className="flex-1 py-2 text-[13px] font-semibold rounded-lg"
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
              className="flex-1 py-2 text-[13px] font-semibold rounded-lg"
              style={{
                backgroundColor: orderSide === 'ask' ? 'var(--upbit-ask)' : 'rgba(0,0,0,0.06)',
                color: orderSide === 'ask' ? '#fff' : 'var(--upbit-text)',
              }}
            >
              매도
            </button>
          </div>
          <div>
            <label className="text-[12px] block mb-1" style={{ color: 'var(--upbit-text-dim)' }}>가격 (USD)</label>
            <input
              type="text"
              inputMode="decimal"
              value={orderPrice}
              onChange={(e) => setOrderPrice(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-[14px] tabular-nums"
              style={{ backgroundColor: 'var(--upbit-bg)', borderColor: 'var(--upbit-border)', color: 'var(--upbit-text)' }}
            />
          </div>
          <div>
            <label className="text-[12px] block mb-1" style={{ color: 'var(--upbit-text-dim)' }}>수량</label>
            <input
              type="number"
              min={1}
              value={orderQty}
              onChange={(e) => setOrderQty(Math.max(1, Number(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-lg border text-[14px] tabular-nums"
              style={{ backgroundColor: 'var(--upbit-bg)', borderColor: 'var(--upbit-border)', color: 'var(--upbit-text)' }}
            />
          </div>
          <div className="flex justify-between text-[13px]">
            <span style={{ color: 'var(--upbit-text-dim)' }}>예상 금액</span>
            <span className="font-semibold tabular-nums" style={{ color: 'var(--upbit-text)' }}>
              {formatKrw(parseFloat(orderPrice || '0') * orderQty, fxRate)}
            </span>
          </div>
          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={loading || !isLoggedIn}
            className="w-full py-3 rounded-lg text-[15px] font-bold disabled:opacity-50"
            style={{
              backgroundColor: orderSide === 'bid' ? 'var(--upbit-bid)' : 'var(--upbit-ask)',
              color: '#fff',
            }}
          >
            {!isLoggedIn ? '로그인 후 주문' : loading ? '처리 중…' : orderSide === 'bid' ? '매수하기' : '매도하기'}
          </button>
        </div>
      )}

      {activeTab === '체결' && (
        <div className="space-y-1 max-h-[200px] overflow-y-auto">
          {trades.length === 0 ? (
            <p className="text-[13px] py-4 text-center" style={{ color: 'var(--upbit-text-dim)' }}>체결 내역 없음</p>
          ) : (
            trades.map((t) => (
              <div key={t.id} className="flex justify-between py-2 text-[13px]" style={{ borderBottom: '1px solid var(--upbit-border)' }}>
                <span className="tabular-nums font-semibold" style={{ color: t.side === 'buy' ? 'var(--upbit-bid)' : 'var(--upbit-ask)' }}>
                  {formatUsd(t.price_usd)}
                </span>
                <span className="tabular-nums" style={{ color: 'var(--upbit-text-dim)' }}>{t.quantity}</span>
                <span className="text-[11px]" style={{ color: 'var(--upbit-text-dim)' }}>
                  {new Date(t.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === '내주문' && (
        <p className="text-[13px] py-4 text-center" style={{ color: 'var(--upbit-text-dim)' }}>
          {isLoggedIn ? '내 주문 내역 (TODO 연동)' : '로그인 후 확인'}
        </p>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { formatKRW } from '@/lib/mock/marketItems';

type OrderType = 'limit' | 'market';
type Side = 'buy' | 'sell';

function num(v: string) {
  const x = Number(String(v).replace(/[^\d.]/g, ''));
  return Number.isFinite(x) ? x : 0;
}

export default function OrderPanelSimple({
  assetId,
  basePrice,
  price: controlledPrice,
  onPriceChange,
  onOrderSuccess,
}: {
  assetId: string;
  basePrice: number;
  price?: string;
  onPriceChange?: (price: string) => void;
  onOrderSuccess?: () => void;
}) {
  const { user } = useAuth();
  const pathname = usePathname() ?? '/';
  const loginHref = `/login?redirect=${encodeURIComponent(pathname)}`;
  const [side, setSide] = useState<Side>('buy');
  const [orderType, setOrderType] = useState<OrderType>('limit');
  const [internalPrice, setInternalPrice] = useState<string>(String(basePrice));
  const [qty, setQty] = useState<string>('1');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const price = controlledPrice ?? internalPrice;
  const setPrice = onPriceChange ?? setInternalPrice;

  const p = orderType === 'market' ? basePrice : num(price);
  const q = num(qty);
  const gross = p * q;
  const feeRate = 0.0005;
  const fee = gross * feeRate;
  const total = side === 'buy' ? gross + fee : Math.max(0, gross - fee);

  const handleSubmit = async () => {
    if (!user) {
      setMessage({ type: 'error', text: '로그인이 필요합니다.' });
      return;
    }
    if (q <= 0) {
      setMessage({ type: 'error', text: '수량은 0보다 커야 합니다.' });
      return;
    }
    if (orderType === 'limit' && (!price.trim() || p <= 0)) {
      setMessage({ type: 'error', text: '지정가 주문은 가격을 입력해주세요.' });
      return;
    }

    setSubmitting(true);
    setMessage(null);
    try {
      if (orderType === 'market') {
        const res = await fetch('/api/orders/place', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content_id: assetId,
            side: side,
            price_krw: Math.round(p),
            qty: q,
          }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          const err = json?.error ?? json?.debug ?? '주문 실패';
          setMessage({ type: 'error', text: err === 'UNAUTHENTICATED' ? '로그인이 필요합니다.' : String(err) });
          return;
        }
        if (json?.ok !== false) {
          setMessage({ type: 'success', text: '주문이 접수되었습니다.' });
          onOrderSuccess?.();
        } else {
          setMessage({ type: 'error', text: json?.error ?? '주문 실패' });
        }
      } else {
        const res = await fetch('/api/orders/orderbook/place', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            item_id: assetId,
            content_id: assetId,
            side: side === 'buy' ? 'bid' : 'ask',
            price_krw: Math.round(p),
            quantity: q,
          }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          const err = json?.error ?? json?.debug ?? '주문 실패';
          setMessage({ type: 'error', text: err === 'UNAUTHORIZED' ? '로그인이 필요합니다.' : String(err) });
          return;
        }
        if (json?.success !== false && !json?.error) {
          setMessage({ type: 'success', text: '주문이 접수되었습니다.' });
          onOrderSuccess?.();
        } else {
          setMessage({ type: 'error', text: json?.error ?? '주문 실패' });
        }
      }
    } catch (e) {
      console.error('[OrderPanelSimple] submit error:', e);
      setMessage({ type: 'error', text: '네트워크 오류입니다. 다시 시도해주세요.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-black/10 bg-white overflow-hidden shadow-[0_6px_20px_rgba(0,0,0,0.05)]">
      <div className="p-4 space-y-4">
        {!user && (
          <div className="rounded-xl border border-amber-300/50 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            주문하려면 <Link href={loginHref} className="underline font-bold">로그인</Link>이 필요합니다.
          </div>
        )}

        {/* 지정가/시장가 */}
        <div className="flex rounded-xl border border-black/10 bg-black/5 p-1">
          {(['limit', 'market'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setOrderType(t)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-extrabold transition ${
                orderType === t ? 'bg-[#2563EB] text-white' : 'text-black/60 hover:text-black'
              }`}
            >
              {t === 'limit' ? '지정가' : '시장가'}
            </button>
          ))}
        </div>

        {/* 매수/매도 */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSide('buy')}
            className={`flex-1 py-3 rounded-xl text-sm font-extrabold transition ${
              side === 'buy' ? 'bg-[#2563EB] text-white' : 'bg-black/5 text-black/60 hover:bg-black/10'
            }`}
          >
            매수
          </button>
          <button
            type="button"
            onClick={() => setSide('sell')}
            className={`flex-1 py-3 rounded-xl text-sm font-extrabold transition ${
              side === 'sell' ? 'bg-red-600 text-white' : 'bg-black/5 text-black/60 hover:bg-black/10'
            }`}
          >
            매도
          </button>
        </div>

        {/* 가격 (지정가일 때만) */}
        {orderType === 'limit' && (
          <div>
            <label className="text-xs text-black/55">가격</label>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-1 w-full px-4 py-3 rounded-xl border border-black/10 bg-white text-base font-extrabold tabular-nums outline-none focus:border-[#2563EB]"
              inputMode="numeric"
              placeholder="가격"
            />
          </div>
        )}
        {orderType === 'market' && (
          <div className="rounded-xl border border-black/10 bg-black/5 px-4 py-3 text-sm">
            <span className="text-black/55">시장가 </span>
            <span className="font-extrabold tabular-nums">{formatKRW(basePrice)}</span>
          </div>
        )}

        {/* 수량 */}
        <div>
          <label className="text-xs text-black/55">수량</label>
          <div className="mt-1 flex gap-2">
            <button
              type="button"
              onClick={() => setQty(String(Math.max(0, (num(qty) || 0) - 0.5)))}
              className="w-12 h-12 rounded-xl border border-black/10 bg-black/5 hover:bg-black/10 text-lg font-extrabold shrink-0"
              aria-label="수량 감소"
            >
              −
            </button>
            <input
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border border-black/10 bg-white text-base font-extrabold tabular-nums text-center outline-none focus:border-[#2563EB]"
              inputMode="decimal"
              placeholder="수량"
            />
            <button
              type="button"
              onClick={() => setQty(String((num(qty) || 0) + 0.5))}
              className="w-12 h-12 rounded-xl border border-black/10 bg-black/5 hover:bg-black/10 text-lg font-extrabold shrink-0"
              aria-label="수량 증가"
            >
              +
            </button>
          </div>
        </div>

        {/* 예상 금액 */}
        <div className="rounded-xl border border-black/10 bg-black/5 p-3 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-black/60">예상 금액</span>
            <span className="font-extrabold tabular-nums">{formatKRW(Math.round(gross))}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-black/60">수수료</span>
            <span className="font-extrabold tabular-nums">{formatKRW(Math.round(fee))}</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-black/10">
            <span className="text-black/70 font-bold">{side === 'buy' ? '총 결제' : '예상 정산'}</span>
            <span className="font-extrabold tabular-nums">{formatKRW(Math.round(total))}</span>
          </div>
        </div>

        {message && (
          <div
            className={`rounded-xl px-4 py-3 text-sm ${
              message.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* CTA */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className={`w-full py-4 rounded-xl text-base font-extrabold transition ${
            side === 'buy'
              ? 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white disabled:opacity-50 disabled:cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed'
          }`}
        >
          {submitting ? '처리 중...' : side === 'buy' ? '매수하기' : '매도하기'}
        </button>
      </div>
    </div>
  );
}

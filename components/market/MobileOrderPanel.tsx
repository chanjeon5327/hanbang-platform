'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToken } from '@/context/TokenContext';
import { useToast } from '@/context/ToastContext';

/* 업비트 KRW 거래 UX: 매수/매도 토글 + 지정가/시장가 탭 + 빠른 비율 버튼 + 주문 요약 — 다중 토큰 표시 (주문은 KRW 기준) */

export default function MobileOrderPanel({
  open,
  side,
  price,
  productId,
  onClose,
  requireLogin,
}: {
  open: boolean;
  side: 'BUY' | 'SELL';
  price: number;
  productId?: string;
  onClose: () => void;
  requireLogin?: boolean;
}) {
  const router = useRouter();
  const [qty, setQty] = useState<number>(1);
  const [orderType, setOrderType] = useState<'limit' | 'market'>('market');
  const [limitPrice, setLimitPrice] = useState(price);
  const [loading, setLoading] = useState(false);

  const { formatPrice } = useToken();
  const { toast } = useToast();
  const estAmountKrw = useMemo(() => Math.max(0, Number.isFinite(qty) ? qty : 0) * (orderType === 'market' ? price : limitPrice), [qty, price, limitPrice, orderType]);

  if (!open) return null;

  const isBuy = side === 'BUY';

  const placeOrder = async () => {
    if (requireLogin) {
      onClose();
      router.push('/login');
      return;
    }
    if (!qty || qty <= 0) {
      toast('수량을 입력하세요.');
      return;
    }
    const execPrice = orderType === 'market' ? price : limitPrice;
    try {
      setLoading(true);
      const res = await fetch('/api/orders/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: productId ?? undefined, side, price: execPrice, quantity: qty }),
      });
      const json = await res.json();
      if (!json.success) {
        toast(`주문 실패: ${json.error}`);
        return;
      }
      const orderId = json.data?.id;
      if (!orderId) {
        toast('주문 ID를 받지 못했습니다.');
        return;
      }
      const stubRes = await fetch('/api/payment/stub', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId }),
      });
      const stubJson = await stubRes.json();
      if (!stubJson.ok) {
        toast(`결제 처리 실패: ${stubJson.error}`);
        return;
      }
      onClose();
      router.push(`/order/success?order_id=${orderId}`);
    } catch {
      toast('주문 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const ratioButtons = [0.25, 0.5, 0.75, 1];
  const maxQty = 100;

  return (
    <div className="fixed inset-0 z-[400] flex items-end" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div
        className="w-full rounded-t-2xl px-4 pt-4 pb-6 border-t border-[var(--upbit-border)]"
        style={{ backgroundColor: 'var(--upbit-panel)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg" style={{ color: 'var(--upbit-text)' }}>
            {isBuy ? '매수' : '매도'}
          </h2>
          <button onClick={onClose} className="body-sm" style={{ color: 'var(--upbit-text-dim)' }}>닫기</button>
        </div>

        {/* 지정가/시장가 탭 */}
        <div className="flex rounded-lg overflow-hidden mb-4" style={{ backgroundColor: 'var(--upbit-bg)' }}>
          <button
            type="button"
            onClick={() => setOrderType('limit')}
            className="flex-1 py-2.5 body-sm font-semibold transition"
            style={{ backgroundColor: orderType === 'limit' ? 'var(--upbit-bid)' : 'transparent', color: orderType === 'limit' ? '#fff' : 'var(--upbit-text-dim)' }}
          >
            지정가
          </button>
          <button
            type="button"
            onClick={() => setOrderType('market')}
            className="flex-1 py-2.5 body-sm font-semibold transition"
            style={{ backgroundColor: orderType === 'market' ? 'var(--upbit-bid)' : 'transparent', color: orderType === 'market' ? '#fff' : 'var(--upbit-text-dim)' }}
          >
            시장가
          </button>
        </div>

        {orderType === 'limit' && (
          <div className="mb-4">
            <label className="caption block mb-1" style={{ color: 'var(--upbit-text-dim)' }}>지정가</label>
            <input
              type="number"
              value={limitPrice}
              onChange={(e) => setLimitPrice(Number(e.target.value) || 0)}
              className="w-full rounded-lg px-4 py-3 body focus:outline-none border border-[var(--upbit-border)]"
              style={{ backgroundColor: 'var(--upbit-bg)', color: 'var(--upbit-text)' }}
            />
          </div>
        )}

        <div className="mb-4">
          <label className="caption block mb-1" style={{ color: 'var(--upbit-text-dim)' }}>수량</label>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            className="w-full rounded-lg px-4 py-3 body focus:outline-none border border-[var(--upbit-border)] mb-2"
            style={{ backgroundColor: 'var(--upbit-bg)', color: 'var(--upbit-text)' }}
            placeholder="0"
          />
          <div className="grid grid-cols-4 gap-2">
            {ratioButtons.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setQty(Math.round(maxQty * r))}
                className="py-2 rounded-lg border body-sm transition border-[var(--upbit-border)]"
                style={{ color: 'var(--upbit-text)' }}
              >
                {r * 100}%
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between body-sm mb-4">
          <span style={{ color: 'var(--upbit-text-dim)' }}>예상 금액</span>
          <span className="font-bold tabular-nums" style={{ color: 'var(--upbit-text)' }}>
            {formatPrice(estAmountKrw)}
          </span>
        </div>

        <button
          disabled={loading}
          onClick={placeOrder}
          data-testid="trade-primary-action"
          className="w-full py-3.5 rounded-lg text-white body font-semibold transition disabled:opacity-60"
          style={{ backgroundColor: isBuy ? 'var(--upbit-bid)' : 'var(--upbit-ask)' }}
        >
          {loading ? '주문 처리 중...' : requireLogin ? '로그인 후 거래' : (isBuy ? '매수' : '매도')}
        </button>

        <p className="caption mt-3 leading-relaxed" style={{ color: 'var(--upbit-text-dim)' }}>
          * 주문은 created 상태로 접수되며, 결제 완료 후 completed 시 원장에 기록됩니다.
        </p>
      </div>
    </div>
  );
}

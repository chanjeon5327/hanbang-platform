'use client';

import { useMemo, useState } from 'react';

export default function MobileOrderPanel({
  open,
  side,
  price,
  onClose,
}: {
  open: boolean;
  side: 'BUY' | 'SELL';
  price: number;
  onClose: () => void;
}) {
  const [qty, setQty] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  const estAmount = useMemo(() => {
    const q = Number.isFinite(qty) ? qty : 0;
    return Math.max(0, q) * price;
  }, [qty, price]);

  if (!open) return null;

  const placeOrder = async () => {
    if (!qty || qty <= 0) {
      alert('수량을 입력하세요.');
      return;
    }

    try {
      setLoading(true);

      const res = await fetch('/api/orders/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          marketId: 'travel-j', // TODO: 실제 market id로 교체
          side,
          price,
          quantity: qty,
        }),
      });

      const json = await res.json();

      if (!json.success) {
        alert(`주문 실패: ${json.error}`);
        return;
      }

      alert('주문 접수 완료 (Gate-3)');
      onClose();
    } catch (e) {
      alert('주문 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[400] bg-black/40 flex items-end"
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-2xl bg-white px-4 pt-4 pb-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">
            {side === 'BUY' ? '매수 주문' : '매도 주문'}
          </h2>
          <button onClick={onClose} className="text-sm text-gray-500">
            닫기
          </button>
        </div>

        {/* 주문 방식 */}
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-1">주문 방식</div>
          <div className="flex items-center justify-between border rounded-xl px-3 py-3">
            <span className="text-sm font-semibold">시장가</span>
            <span className="text-sm text-gray-500">
              ₩{price.toLocaleString()}
            </span>
          </div>
        </div>

        {/* 수량 */}
        <div className="mb-4">
          <label className="text-xs text-gray-500">수량</label>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            className="w-full mt-1 border rounded-xl px-3 py-3 text-base"
            placeholder="0"
          />
          <div className="grid grid-cols-4 gap-2 mt-2">
            {[1, 5, 10, 20].map((n) => (
              <button
                key={n}
                onClick={() =>
                  setQty((prev) =>
                    Number.isFinite(prev) ? prev + n : n
                  )
                }
                className="py-2 rounded-xl border text-sm"
              >
                +{n}
              </button>
            ))}
          </div>
        </div>

        {/* 예상 금액 */}
        <div className="flex items-center justify-between text-sm mb-4">
          <span className="text-gray-600">예상 금액</span>
          <span className="font-bold">
            ₩{estAmount.toLocaleString()}
          </span>
        </div>

        <button
          disabled={loading}
          className={`w-full py-3 rounded-xl text-white font-semibold ${
            side === 'BUY' ? 'bg-blue-600' : 'bg-red-600'
          } ${loading ? 'opacity-60' : ''}`}
          onClick={placeOrder}
        >
          {loading ? '주문 처리 중...' : '주문 확정'}
        </button>

        <p className="text-[11px] text-gray-400 mt-3 leading-relaxed">
          * 주문은 접수 즉시 원장에 기록되며, 체결/정산은 다음 단계에서 처리됩니다.
        </p>
      </div>
    </div>
  );
}

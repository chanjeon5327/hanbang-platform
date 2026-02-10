'use client';

type Side = 'BUY' | 'SELL';

export default function MobileOrderPanel({
  open,
  side,
  price,
  onClose,
}: {
  open: boolean;
  side: Side;
  price: number;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[500] bg-black/40 flex items-end">
      <div className="w-full rounded-t-2xl bg-white px-4 py-5">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg">
            {side === 'BUY' ? '매수 주문' : '매도 주문'}
          </h2>
          <button onClick={onClose} className="text-sm text-gray-500">
            닫기
          </button>
        </div>

        {/* Price */}
        <div className="mb-4">
          <div className="text-sm text-gray-500">현재가</div>
          <div className="text-xl font-bold">₩{price.toLocaleString()}</div>
        </div>

        {/* Quantity */}
        <div className="mb-4">
          <label className="text-sm text-gray-500">수량</label>
          <input
            type="number"
            placeholder="0"
            className="w-full mt-1 border rounded-lg px-3 py-2"
          />
        </div>

        {/* Amount */}
        <div className="flex justify-between text-sm mb-4">
          <span>예상 금액</span>
          <span className="font-semibold">₩0</span>
        </div>

        {/* Submit */}
        <button
          className={`w-full py-3 rounded-xl text-white font-semibold ${
            side === 'BUY' ? 'bg-blue-600' : 'bg-red-600'
          }`}
        >
          {side === 'BUY' ? '매수 확정' : '매도 확정'}
        </button>
      </div>
    </div>
  );
}

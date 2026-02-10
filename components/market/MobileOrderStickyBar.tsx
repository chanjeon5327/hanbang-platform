'use client';

type Side = 'BUY' | 'SELL';

export default function MobileOrderStickyBar({
  side,
  price,
  onOpen,
}: {
  side: Side;
  price: number;
  onOpen: () => void;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[400] border-t bg-white px-4 py-3">
      <div className="flex justify-between items-center mb-2">
        <div>
          <div className="text-xs text-gray-500">현재가</div>
          <div className="font-bold">₩{price.toLocaleString()}</div>
        </div>
        <button
          onClick={onOpen}
          className={`px-6 py-3 rounded-xl text-white font-semibold ${
            side === 'BUY' ? 'bg-blue-600' : 'bg-red-600'
          }`}
        >
          {side === 'BUY' ? '매수하기' : '매도하기'}
        </button>
      </div>
    </div>
  );
}

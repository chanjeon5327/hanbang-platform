'use client';

export default function MobileOrderStickyBar({
  side,
  price,
  change,
  onOpen,
}: {
  side: 'BUY' | 'SELL';
  price: number;
  change: number;
  onOpen: () => void;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[200] border-t bg-white px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-xs text-gray-500">현재가</div>
          <div className="font-bold">₩{price.toLocaleString()}</div>
        </div>
        <div className={`text-sm font-semibold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change > 0 ? '+' : ''}
          {change}%
        </div>
      </div>

      <button
        onClick={onOpen}
        className={`w-full py-3 rounded-xl text-white text-base font-semibold ${
          side === 'BUY' ? 'bg-blue-600' : 'bg-red-600'
        }`}
      >
        {side === 'BUY' ? '매수하기' : '매도하기'}
      </button>
    </div>
  );
}

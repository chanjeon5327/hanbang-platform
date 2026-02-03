'use client';

type Order = {
  price: number;
  volume: number;
  type: 'buy' | 'sell';
};

const MOCK_ORDERS: Order[] = [
  { price: 12503.2, volume: 3.1, type: 'sell' },
  { price: 12501.7, volume: 1.4, type: 'sell' },
  { price: 12500.1, volume: 2.0, type: 'sell' },
  { price: 12490.8, volume: 4.8, type: 'sell' },
  { price: 12485.1, volume: 2.3, type: 'buy' },
  { price: 12470.9, volume: 5.2, type: 'buy' },
  { price: 12460.3, volume: 1.1, type: 'buy' },
];

export default function LiveTickerCard() {
  return (
    <div className="w-full max-w-md rounded-2xl bg-white dark:bg-neutral-800 border border-gray-200 dark:border-white/10 shadow-sm">
      {/* 헤더 */}
      <div className="px-5 py-4 border-b border-gray-100 dark:border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 tracking-wide">
              지금 뜨는 채널
            </p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              유튜브 먹방 채널 A
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-red-400">
              +3.2%
            </p>
            <p className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              ₩12,503
            </p>
          </div>
        </div>
      </div>

      {/* 호가 리스트 */}
      <div className="divide-y divide-gray-100 dark:divide-white/5">
        {MOCK_ORDERS.map((order, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between px-5 py-2 text-sm"
          >
            <span
              className={
                order.type === 'sell'
                  ? 'text-red-400'
                  : 'text-blue-400'
              }
            >
              ₩{order.price.toLocaleString()}
            </span>
            <span className="text-gray-400">
              {order.volume}
            </span>
          </div>
        ))}
      </div>

      {/* 하단 액션 */}
      <div className="px-5 py-3 border-t border-gray-100 dark:border-white/10">
        <button className="w-full py-2 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition text-sm font-medium">
          거래 화면 미리보기
        </button>
      </div>
    </div>
  );
}

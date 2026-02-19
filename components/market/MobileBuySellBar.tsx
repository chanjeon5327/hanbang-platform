'use client';

type Props = {
  onSellClick: () => void;
  onBuyClick: () => void;
};

export default function MobileBuySellBar({ onSellClick, onBuyClick }: Props) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 border-t p-4"
      style={{
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)',
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
      }}
    >
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onSellClick}
          className="flex-1 h-14 rounded-2xl font-bold text-white transition hover:opacity-90 active:opacity-95"
          style={{
            backgroundColor: 'var(--royal-blue)',
            fontSize: 14,
          }}
        >
          판매하기
        </button>
        <button
          type="button"
          onClick={onBuyClick}
          className="flex-1 h-14 rounded-2xl font-bold text-white transition hover:opacity-90 active:opacity-95"
          style={{
            backgroundColor: 'var(--accent-loss)',
            fontSize: 14,
          }}
        >
          구매하기
        </button>
      </div>
    </div>
  );
}

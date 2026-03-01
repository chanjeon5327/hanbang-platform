'use client';

import { v3 } from '@/lib/design/tokens';

type Props = {
  onBuyClick: () => void;
  onSellClick: () => void;
  disabled?: boolean;
};

export default function MarketDetailCTAV3({
  onBuyClick,
  onSellClick,
  disabled = false,
}: Props) {
  const btnBase =
    'flex-1 min-h-[52px] rounded-2xl font-bold transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 border-t"
      style={{
        padding: v3.padding.md,
        paddingBottom: `max(${v3.padding.md}px, env(safe-area-inset-bottom))`,
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)',
        boxShadow: '0 -2px 8px rgba(15,23,42,0.04)',
      }}
    >
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onSellClick}
          disabled={disabled}
          className={btnBase}
          style={{
            fontSize: v3.caption.size,
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--royal-blue)',
            border: '2px solid var(--royal-blue)',
          }}
        >
          매도
        </button>
        <button
          type="button"
          onClick={onBuyClick}
          disabled={disabled}
          className={btnBase}
          style={{
            fontSize: v3.caption.size,
            backgroundColor: 'var(--royal-blue)',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(30,64,175,0.25)',
          }}
        >
          매수
        </button>
      </div>
    </div>
  );
}

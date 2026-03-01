'use client';

import { spacing, colors } from '@/lib/design/tokens';

type Props = {
  onBuyClick: () => void;
  onSellClick: () => void;
  disabled?: boolean;
};

export default function TradeCTA({
  onBuyClick,
  onSellClick,
  disabled = false,
}: Props) {
  const btnClass =
    'flex-1 min-h-[52px] rounded-2xl font-bold text-white transition hover:opacity-90 active:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center';
  const touchMin = { minHeight: 52, minWidth: 44 };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 border-t p-4 safe-area-pb"
      style={{
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)',
        boxShadow: '0 -1px 4px rgba(15,23,42,0.06)',
        paddingBottom: `max(${spacing.md}px, env(safe-area-inset-bottom))`,
      }}
    >
      <div
        className="flex gap-3"
        style={{ gap: spacing.lg }}
      >
        <button
          type="button"
          onClick={onSellClick}
          disabled={disabled}
          className={btnClass}
          style={{
            ...touchMin,
            backgroundColor: colors.down,
            fontSize: 14,
          }}
        >
          매도
        </button>
        <button
          type="button"
          onClick={onBuyClick}
          disabled={disabled}
          className={btnClass}
          style={{
            ...touchMin,
            backgroundColor: colors.up,
            fontSize: 14,
          }}
        >
          매수
        </button>
      </div>
    </div>
  );
}

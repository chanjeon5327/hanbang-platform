'use client';

import { useToken } from '@/context/TokenContext';

/* 업비트 KRW 거래 UX: 모바일 하단 고정 주문바 — 다중 토큰 지원 */

export default function MobileOrderStickyBar({
  side,
  price,
  change,
  onOpen,
  disabled,
}: {
  side: 'BUY' | 'SELL';
  price: number;
  change: number;
  onOpen: () => void;
  disabled?: boolean;
}) {
  const isBuy = side === 'BUY';
  const { formatPrice } = useToken();

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[200] px-4 py-3 border-t border-[var(--upbit-border)]"
      style={{ backgroundColor: 'var(--upbit-panel)' }}
    >
      <div className="flex justify-between items-center mb-2">
        <div>
          <div className="text-[11px]" style={{ color: 'var(--upbit-text-dim)' }}>현재가</div>
          <div className="font-bold tabular-nums" style={{ color: 'var(--upbit-text)' }}>
            {formatPrice(price)}
          </div>
        </div>
        <div
          className="text-[14px] font-semibold tabular-nums"
          style={{ color: change >= 0 ? 'var(--upbit-positive)' : 'var(--upbit-ask)' }}
        >
          {change > 0 ? '+' : ''}{change}%
        </div>
      </div>
      <button
        onClick={disabled ? undefined : onOpen}
        disabled={disabled}
        className="w-full py-3 rounded-lg text-white text-base font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: isBuy ? 'var(--upbit-bid)' : 'var(--upbit-ask)' }}
      >
        {isBuy ? '매수' : '매도'}
      </button>
    </div>
  );
}

'use client';

import { useToken } from '@/context/TokenContext';

/* 업비트형 호가창: 매도(빨강) 상단 · 현재가 중앙 · 매수(파랑) 하단 · 비율 바 — 다중 토큰 지원 */

const maxSize = 250;

function OrderRow({
  price,
  size,
  isAsk,
  max,
  formatPrice,
}: {
  price: number;
  size: number;
  isAsk: boolean;
  max: number;
  formatPrice: (krw: number) => string;
}) {
  const pct = max > 0 ? (size / max) * 100 : 0;
  return (
    <div className="relative grid grid-cols-3 px-3 py-1.5 body-sm">
      <div
        className="absolute inset-y-0 opacity-15"
        style={{
          width: `${pct}%`,
          left: isAsk ? 0 : undefined,
          right: isAsk ? undefined : 0,
          backgroundColor: isAsk ? 'var(--upbit-ask)' : 'var(--upbit-bid)',
        }}
      />
      {isAsk ? (
        <>
          <span className="relative z-10 text-[var(--upbit-ask)] font-medium" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatPrice(price)}
          </span>
          <span className="relative z-10 text-center text-[var(--upbit-text-dim)]" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {size}
          </span>
          <span className="relative z-10" />
        </>
      ) : (
        <>
          <span className="relative z-10" />
          <span className="relative z-10 text-center text-[var(--upbit-text-dim)]" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {size}
          </span>
          <span className="relative z-10 text-right text-[var(--upbit-bid)] font-medium" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatPrice(price)}
          </span>
        </>
      )}
    </div>
  );
}

export function OrderBookSummary({ onOpen }: { onOpen: () => void }) {
  const { formatPrice } = useToken();
  const sellRows = [
    { price: 12350, size: 120 },
    { price: 12340, size: 85 },
    { price: 12330, size: 200 },
  ];
  const buyRows = [
    { price: 12290, size: 95 },
    { price: 12280, size: 150 },
    { price: 12270, size: 80 },
  ];
  const currentPrice = 12300;
  const totalMax = Math.max(...sellRows.map((r) => r.size), ...buyRows.map((r) => r.size), 1);

  return (
    <section className="px-4 mt-4">
      <div
        onClick={onOpen}
        className="bg-[var(--upbit-panel)] rounded-[var(--upbit-radius)] border border-[var(--upbit-border)] overflow-hidden"
      >
        <div className="grid grid-cols-3 caption text-[var(--upbit-text-dim)] px-3 py-2 border-b border-[var(--upbit-border)]">
          <span>매도호가</span>
          <span className="text-center">수량</span>
          <span className="text-right">매수호가</span>
        </div>
        {sellRows.map((r) => (
          <OrderRow key={r.price} price={r.price} size={r.size} isAsk max={totalMax} formatPrice={formatPrice} />
        ))}
        <div className="grid grid-cols-3 px-3 py-2.5 bg-[var(--upbit-border)]/50 border-y border-[var(--upbit-border)]">
          <span />
          <span className="text-center font-bold text-[var(--upbit-text)]" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatPrice(currentPrice)}
          </span>
          <span />
        </div>
        {buyRows.map((r) => (
          <OrderRow key={r.price} price={r.price} size={r.size} isAsk={false} max={totalMax} formatPrice={formatPrice} />
        ))}
      </div>
      <p className="caption text-center text-[var(--upbit-text-dim)] mt-2">탭하여 전체 호가 보기</p>
    </section>
  );
}

export function OrderBookPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { formatPrice } = useToken();

  if (!open) return null;

  const sellRows = Array.from({ length: 15 }, (_, i) => ({ price: 12350 - i * 10, size: 50 + i * 10 }));
  const buyRows = Array.from({ length: 15 }, (_, i) => ({ price: 12290 - i * 10, size: 40 + i * 8 }));
  const currentPrice = 12300;
  const totalMax = Math.max(...sellRows.map((r) => r.size), ...buyRows.map((r) => r.size), 1);

  return (
    <div className="fixed inset-0 z-[300] bg-black/60 flex items-end">
      <div className="w-full max-h-[85vh] bg-[var(--upbit-bg)] border-t border-[var(--upbit-border)] rounded-t-2xl">
        <div className="flex justify-between items-center px-4 py-3 border-b border-[var(--upbit-border)]">
          <h2 className="font-bold text-[var(--upbit-text)]">호가</h2>
          <button onClick={onClose} className="body-sm text-[var(--upbit-bid)] font-medium">
            닫기
          </button>
        </div>
        <div className="overflow-y-auto max-h-[70vh] p-4">
          <div className="grid grid-cols-3 caption text-[var(--upbit-text-dim)] mb-2">
            <span>매도호가</span>
            <span className="text-center">수량</span>
            <span className="text-right">매수호가</span>
          </div>
          {sellRows.map((r) => (
            <OrderRow key={`s-${r.price}`} price={r.price} size={r.size} isAsk max={totalMax} formatPrice={formatPrice} />
          ))}
          <div className="grid grid-cols-3 py-2.5 my-2 bg-[var(--upbit-border)]/50 rounded-lg">
            <span />
            <span className="text-center font-bold text-[var(--upbit-text)]" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatPrice(currentPrice)}
            </span>
            <span />
          </div>
          {buyRows.map((r) => (
            <OrderRow key={`b-${r.price}`} price={r.price} size={r.size} isAsk={false} max={totalMax} formatPrice={formatPrice} />
          ))}
        </div>
      </div>
    </div>
  );
}

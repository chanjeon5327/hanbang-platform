'use client';

import { useToken } from '@/context/TokenContext';

/**
 * 호가 영역: 매도호가, 매수호가, 체결 내역
 * 거래소형 구조
 */
const MOCK_ASKS = [
  { price: 12350, size: 120 },
  { price: 12340, size: 85 },
  { price: 12330, size: 200 },
  { price: 12320, size: 95 },
  { price: 12310, size: 150 },
];

const MOCK_BIDS = [
  { price: 12290, size: 95 },
  { price: 12280, size: 150 },
  { price: 12270, size: 80 },
  { price: 12260, size: 120 },
  { price: 12250, size: 90 },
];

const MOCK_TRADES = [
  { price: 12300, size: 5, time: '14:32:01', side: 'buy' as const },
  { price: 12290, size: 3, time: '14:31:58', side: 'sell' as const },
  { price: 12300, size: 10, time: '14:31:55', side: 'buy' as const },
  { price: 12280, size: 7, time: '14:31:50', side: 'sell' as const },
  { price: 12310, size: 2, time: '14:31:45', side: 'buy' as const },
];

function OrderRow({ price, size, isAsk, max, formatPrice }: { price: number; size: number; isAsk: boolean; max: number; formatPrice: (n: number) => string }) {
  const pct = max > 0 ? (size / max) * 100 : 0;
  return (
    <div className="relative grid grid-cols-3 px-2 py-1 text-[12px]">
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
          <span className="relative z-10 font-medium tabular-nums" style={{ color: 'var(--upbit-ask)' }}>{formatPrice(price)}</span>
          <span className="relative z-10 text-center tabular-nums" style={{ color: 'var(--upbit-text-dim)' }}>{size}</span>
          <span className="relative z-10" />
        </>
      ) : (
        <>
          <span className="relative z-10" />
          <span className="relative z-10 text-center tabular-nums" style={{ color: 'var(--upbit-text-dim)' }}>{size}</span>
          <span className="relative z-10 text-right font-medium tabular-nums" style={{ color: 'var(--upbit-bid)' }}>{formatPrice(price)}</span>
        </>
      )}
    </div>
  );
}

export default function OrderBookPanel() {
  const { formatPrice } = useToken();
  const totalMax = Math.max(...MOCK_ASKS.map((r) => r.size), ...MOCK_BIDS.map((r) => r.size), 1);

  return (
    <section className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--upbit-panel)', borderColor: 'var(--upbit-border)' }}>
      <div className="grid grid-cols-3 text-[11px] px-2 py-2 border-b" style={{ color: 'var(--upbit-text-dim)', borderColor: 'var(--upbit-border)' }}>
        <span>매도호가</span>
        <span className="text-center">수량</span>
        <span className="text-right">매수호가</span>
      </div>
      {MOCK_ASKS.map((r) => (
        <OrderRow key={`a-${r.price}`} price={r.price} size={r.size} isAsk max={totalMax} formatPrice={formatPrice} />
      ))}
      <div className="grid grid-cols-3 px-2 py-2 my-1" style={{ backgroundColor: 'var(--upbit-border)', opacity: 0.3 }}>
        <span />
        <span className="text-center font-bold text-[13px] tabular-nums" style={{ color: 'var(--upbit-text)' }}>{formatPrice(12300)}</span>
        <span />
      </div>
      {MOCK_BIDS.map((r) => (
        <OrderRow key={`b-${r.price}`} price={r.price} size={r.size} isAsk={false} max={totalMax} formatPrice={formatPrice} />
      ))}
      <div className="border-t mt-2 pt-2" style={{ borderColor: 'var(--upbit-border)' }}>
        <div className="grid grid-cols-3 text-[11px] px-2 py-1" style={{ color: 'var(--upbit-text-dim)' }}>
          <span>체결가</span>
          <span className="text-center">수량</span>
          <span className="text-right">시간</span>
        </div>
        {MOCK_TRADES.slice(0, 5).map((t, i) => (
          <div key={i} className="grid grid-cols-3 px-2 py-1 text-[12px]">
            <span className="tabular-nums font-medium" style={{ color: t.side === 'buy' ? 'var(--upbit-bid)' : 'var(--upbit-ask)' }}>{formatPrice(t.price)}</span>
            <span className="text-center tabular-nums" style={{ color: 'var(--upbit-text-dim)' }}>{t.size}</span>
            <span className="text-right tabular-nums" style={{ color: 'var(--upbit-text-dim)' }}>{t.time}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

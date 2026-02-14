'use client';

import { useState, useMemo } from 'react';

const TAX_RATE = 0.154; // 15.4% 세금

type Props = {
  yieldRate?: number; // 연 수익률 %
  defaultAmount?: number;
  onAmountChange?: (amount: number) => void;
};

function formatPrice(n: number): string {
  return `₩${n.toLocaleString()}`;
}

export default function ExpectedReturnBox({
  yieldRate = 8.4,
  defaultAmount = 100_000,
  onAmountChange,
}: Props) {
  const [amount, setAmount] = useState(defaultAmount);
  const [showAfterTax, setShowAfterTax] = useState(false);

  const calc = useMemo(() => {
    const annualRate = yieldRate / 100;
    const m3 = amount * (annualRate * (3 / 12));
    const m6 = amount * (annualRate * (6 / 12));
    const y1 = amount * annualRate;
    const tax = showAfterTax ? TAX_RATE : 0;
    return {
      m3Before: m3,
      m6Before: m6,
      y1Before: y1,
      m3After: m3 * (1 - tax),
      m6After: m6 * (1 - tax),
      y1After: y1 * (1 - tax),
    };
  }, [amount, yieldRate, showAfterTax]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value.replace(/\D/g, ''), 10) || 0;
    const clamped = Math.min(1_000_000_000, Math.max(0, v));
    setAmount(clamped);
    onAmountChange?.(clamped);
  };

  return (
    <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--upbit-panel)', borderColor: 'var(--upbit-border)' }}>
      <h3 className="text-[15px] font-bold mb-3" style={{ color: 'var(--upbit-text)' }}>예상 수익 계산기</h3>

      <div className="mb-4">
        <label className="text-[12px] block mb-1" style={{ color: 'var(--upbit-text-dim)' }}>투자 금액</label>
        <input
          type="text"
          inputMode="numeric"
          value={amount ? amount.toLocaleString() : ''}
          onChange={handleInput}
          placeholder="100,000"
          className="w-full px-4 py-3 rounded-lg border text-[16px] font-semibold tabular-nums focus:outline-none focus:ring-2 focus:ring-[var(--upbit-bid)]"
          style={{ backgroundColor: 'var(--upbit-bg)', borderColor: 'var(--upbit-border)', color: 'var(--upbit-text)' }}
        />
      </div>

      <div className="mb-3">
        <label className="text-[12px] block mb-1" style={{ color: 'var(--upbit-text-dim)' }}>예상 연 수익률</label>
        <p className="text-[18px] font-bold" style={{ color: 'var(--upbit-positive)' }}>{yieldRate}%</p>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="rounded-lg p-3 text-center" style={{ backgroundColor: 'var(--upbit-bg)' }}>
          <div className="text-[11px]" style={{ color: 'var(--upbit-text-dim)' }}>3개월</div>
          <div className="text-[14px] font-bold tabular-nums" style={{ color: 'var(--upbit-text)' }}>
            {formatPrice(showAfterTax ? calc.m3After : calc.m3Before)}
          </div>
        </div>
        <div className="rounded-lg p-3 text-center" style={{ backgroundColor: 'var(--upbit-bg)' }}>
          <div className="text-[11px]" style={{ color: 'var(--upbit-text-dim)' }}>6개월</div>
          <div className="text-[14px] font-bold tabular-nums" style={{ color: 'var(--upbit-text)' }}>
            {formatPrice(showAfterTax ? calc.m6After : calc.m6Before)}
          </div>
        </div>
        <div className="rounded-lg p-3 text-center" style={{ backgroundColor: 'var(--upbit-bg)' }}>
          <div className="text-[11px]" style={{ color: 'var(--upbit-text-dim)' }}>1년</div>
          <div className="text-[14px] font-bold tabular-nums" style={{ color: 'var(--upbit-positive)' }}>
            {formatPrice(showAfterTax ? calc.y1After : calc.y1Before)}
          </div>
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer mb-2">
        <input
          type="checkbox"
          checked={showAfterTax}
          onChange={(e) => setShowAfterTax(e.target.checked)}
          className="rounded"
        />
        <span className="text-[12px]" style={{ color: 'var(--upbit-text-dim)' }}>세후 (15.4% 세금 적용)</span>
      </label>

      <p className="text-[11px]" style={{ color: 'var(--upbit-text-dim)' }}>
        * 가정 기반 계산입니다. 실제 수익은 콘텐츠 성과에 따라 달라질 수 있습니다.
      </p>
    </div>
  );
}

'use client';

import { useState, useMemo } from 'react';

const TAX_RATE = 0.154; // 15.4% 세금

type Props = {
  yieldRate?: number; // 월 수익률 %
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

  const monthlyRate = yieldRate;
  const monthlyProfit = amount * (monthlyRate / 100);
  const annualRate = monthlyRate * 12;
  const annualProfit = monthlyProfit * 12;

  const calc = useMemo(() => {
    const profit = amount * (yieldRate / 100);
    const tax = showAfterTax ? TAX_RATE : 0;
    return {
      m3: profit * 3 * (1 - tax),
      m6: profit * 6 * (1 - tax),
      m12: profit * 12 * (1 - tax),
    };
  }, [amount, yieldRate, showAfterTax]);

  const displayMonthlyProfit = showAfterTax ? monthlyProfit * (1 - TAX_RATE) : monthlyProfit;
  const displayAnnualProfit = showAfterTax ? annualProfit * (1 - TAX_RATE) : annualProfit;

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value.replace(/\D/g, ''), 10) || 0;
    const clamped = Math.min(1_000_000_000, Math.max(0, v));
    setAmount(clamped);
    onAmountChange?.(clamped);
  };

  return (
    <div className="rounded-3xl p-4" style={{ backgroundColor: 'rgba(49,130,246,0.06)' }}>
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

      {/* 메인 KPI: 예상 월 수익률 */}
      <div className="mb-2">
        <label className="text-[12px] block mb-1" style={{ color: 'var(--upbit-text-dim)' }}>예상 월 수익률</label>
        <p className="text-[24px] font-extrabold tabular-nums" style={{ color: 'var(--upbit-positive)' }}>{monthlyRate}%</p>
      </div>

      {/* 월 예상 수익 금액 강조 */}
      <p className="text-[18px] font-extrabold tabular-nums mb-3" style={{ color: 'var(--upbit-text)' }}>
        월 예상 수익 {formatPrice(Math.round(displayMonthlyProfit))}
      </p>

      {/* 연 환산 보조 */}
      <p className="text-[12px] mb-4" style={{ color: 'var(--upbit-text-dim)' }}>
        연 환산 {annualRate}% · {formatPrice(Math.round(displayAnnualProfit))} (단리 기준)
      </p>

      {/* 3/6/12개월 - 월 기준 */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="rounded-lg p-3 text-center" style={{ backgroundColor: 'rgba(49,130,246,0.08)' }}>
          <div className="text-[11px]" style={{ color: 'var(--upbit-text-dim)' }}>3개월</div>
          <div className="text-[14px] font-extrabold tabular-nums" style={{ color: 'var(--upbit-text)' }}>
            {formatPrice(Math.round(calc.m3))}
          </div>
        </div>
        <div className="rounded-lg p-3 text-center" style={{ backgroundColor: 'rgba(49,130,246,0.08)' }}>
          <div className="text-[11px]" style={{ color: 'var(--upbit-text-dim)' }}>6개월</div>
          <div className="text-[14px] font-extrabold tabular-nums" style={{ color: 'var(--upbit-text)' }}>
            {formatPrice(Math.round(calc.m6))}
          </div>
        </div>
        <div className="rounded-lg p-3 text-center" style={{ backgroundColor: 'rgba(49,130,246,0.08)' }}>
          <div className="text-[11px]" style={{ color: 'var(--upbit-text-dim)' }}>12개월</div>
          <div className="text-[14px] font-extrabold tabular-nums" style={{ color: 'var(--upbit-positive)' }}>
            {formatPrice(Math.round(calc.m12))}
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

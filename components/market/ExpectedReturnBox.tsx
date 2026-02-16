'use client';

import { useState, useMemo } from 'react';
import MetricRow from '@/components/ui/MetricRow';
import { CardV5 } from '@/components/ui/CardV5';

const TAX_RATE = 0.154;

type Props = {
  yieldRate?: number;
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

  const summaryItems = [
    { label: '예상 월 수익률', value: `${monthlyRate}%`, tone: 'positive' as const },
    { label: '월 예상 수익', value: formatPrice(Math.round(displayMonthlyProfit)) },
    { label: '연 환산', value: `${annualRate}% · ${formatPrice(Math.round(displayAnnualProfit))}` },
  ];

  const periodItems = [
    { label: '3개월', value: formatPrice(Math.round(calc.m3)) },
    { label: '6개월', value: formatPrice(Math.round(calc.m6)) },
    { label: '12개월', value: formatPrice(Math.round(calc.m12)), tone: 'positive' as const },
  ];

  return (
    <CardV5 style={{ backgroundColor: 'rgba(49,130,246,0.04)' }}>
      <h3 className="body font-bold mb-4" style={{ color: 'var(--text)' }}>예상 수익 계산기</h3>

      <div className="mb-4">
        <label className="caption block mb-1" style={{ color: 'var(--text-secondary)' }}>투자 금액</label>
        <input
          type="text"
          inputMode="numeric"
          value={amount ? amount.toLocaleString() : ''}
          onChange={handleInput}
          placeholder="100,000"
          className="w-full px-4 py-3 rounded-xl border body font-semibold metric-number focus:outline-none focus:ring-2 focus:ring-[var(--royal-blue)]"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text)' }}
        />
      </div>

      <MetricRow items={summaryItems} columns={3} dense className="mb-4" />
      <MetricRow items={periodItems} columns={3} dense className="mb-4" />

      <label className="flex items-center gap-2 cursor-pointer mb-2">
        <input type="checkbox" checked={showAfterTax} onChange={(e) => setShowAfterTax(e.target.checked)} className="rounded" />
        <span className="caption" style={{ color: 'var(--text-secondary)' }}>세후 (15.4% 세금 적용)</span>
      </label>

      <p className="caption" style={{ color: 'var(--text-secondary)' }}>
        * 가정 기반 계산입니다. 실제 수익은 콘텐츠 성과에 따라 달라질 수 있습니다.
      </p>
    </CardV5>
  );
}

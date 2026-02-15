'use client';

import { useState, useMemo } from 'react';
import { formatKrw, formatRate } from '@/lib/utils/format';

type Props = {
  sharePriceKrw?: number;
  dividendPerShare?: number;
  expectedAnnualYield?: number;
  onInvestClick?: (amount: number) => void;
};

export default function DividendSimulator({
  sharePriceKrw = 13_500,
  dividendPerShare = 360,
  expectedAnnualYield = 8.4,
  onInvestClick,
}: Props) {
  const [investAmount, setInvestAmount] = useState(100_000);

  const quantity = useMemo(() => {
    if (sharePriceKrw <= 0) return 0;
    return Math.floor(investAmount / sharePriceKrw);
  }, [investAmount, sharePriceKrw]);

  const monthlyDividend = useMemo(() => quantity * dividendPerShare, [quantity, dividendPerShare]);
  const annualDividend = useMemo(() => monthlyDividend * 12, [monthlyDividend]);

  return (
    <div
      className="rounded-[16px] p-6 border card"
      style={{
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <h3 className="text-[16px] font-bold mb-4" style={{ color: 'var(--text)' }}>
        수익률 시뮬레이터
      </h3>

      <div className="mb-4">
        <label className="text-[12px] font-medium block mb-2" style={{ color: 'var(--text-secondary)' }}>
          투자금 (원)
        </label>
        <input
          type="number"
          value={investAmount}
          onChange={(e) => setInvestAmount(Math.max(0, Number(e.target.value) || 0))}
          className="w-full rounded-xl px-4 py-3 text-[16px] font-bold tabular-nums border"
          style={{
            backgroundColor: 'var(--bg)',
            borderColor: 'var(--border)',
            color: 'var(--text)',
          }}
          min={10000}
          step={10000}
        />
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-[14px]">
          <span style={{ color: 'var(--text-secondary)' }}>예상 보유 수량</span>
          <span className="font-bold tabular-nums metric" style={{ color: 'var(--text)' }}>
            {quantity.toLocaleString()}주
          </span>
        </div>
        <div className="flex justify-between text-[14px]">
          <span style={{ color: 'var(--text-secondary)' }}>월 배당</span>
          <span className="font-bold tabular-nums metric text-profit">
            {formatKrw(monthlyDividend)}
          </span>
        </div>
        <div className="flex justify-between text-[14px]">
          <span style={{ color: 'var(--text-secondary)' }}>연 배당</span>
          <span className="font-bold tabular-nums metric text-profit">
            {formatKrw(annualDividend)}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onInvestClick?.(investAmount)}
        className="w-full rounded-[16px] py-4 text-[16px] font-bold tap-scale"
        style={{
          backgroundColor: 'var(--royal-blue)',
          color: '#fff',
          boxShadow: 'var(--shadow-royal)',
        }}
      >
        {formatKrw(investAmount)} 엔젤로 참여하기
      </button>
    </div>
  );
}

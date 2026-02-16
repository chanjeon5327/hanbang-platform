'use client';

import { useState, useMemo } from 'react';
import { formatKrw, formatRate, formatQuantity } from '@/lib/utils/format';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { CardV5 } from '@/components/ui/CardV5';

type Props = {
  investAmount?: number;
  fxRate?: number;
  monthlyRevenue?: number;
  dividendRatio?: number;
  totalShares?: number;
  sharePriceKrw?: number;
  dividendPerShare?: number;
  expectedAnnualYield?: number;
  loading?: boolean;
  error?: string | null;
  onInvestClick?: (amount: number) => void;
};

export default function DividendSimulatorV2({
  investAmount: initialAmount = 100_000,
  fxRate = 1350,
  monthlyRevenue = 120_000_000,
  dividendRatio = 0.3,
  totalShares = 100_000,
  sharePriceKrw,
  dividendPerShare: propDividendPerShare,
  expectedAnnualYield: propYield,
  loading = false,
  error = null,
  onInvestClick,
}: Props) {
  const [investAmount, setInvestAmount] = useState(initialAmount);

  const distributable = useMemo(() => monthlyRevenue * dividendRatio, [monthlyRevenue, dividendRatio]);
  const dividendPerShare = propDividendPerShare ?? (totalShares > 0 ? distributable / totalShares : 0);
  const sharePrice = sharePriceKrw ?? 13_500;
  const quantity = sharePrice > 0 ? Math.floor(investAmount / sharePrice) : 0;
  const monthlyDividend = quantity * dividendPerShare;
  const annualDividend = monthlyDividend * 12;
  const expectedYield = propYield ?? (sharePrice > 0 ? (dividendPerShare * 12) / sharePrice * 100 : 0);

  if (loading) {
    return (
      <CardV5>
        <Skeleton className="h-8 w-32 mb-4" />
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-24 w-full" />
      </CardV5>
    );
  }

  if (error) {
    return (
      <CardV5>
        <EmptyState title="시뮬레이션 로드 실패" description={error} />
      </CardV5>
    );
  }

  return (
    <CardV5>
      <div className="flex items-center justify-between mb-2">
        <h3 className="body font-bold" style={{ color: 'var(--text)' }}>수익률 시뮬레이터</h3>
        <span className="caption px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>B) 시뮬레이션 기반 예상치</span>
      </div>

      <div className="mb-4">
        <label className="caption font-medium block mb-2" style={{ color: 'var(--text-secondary)' }}>투자금 (KRW)</label>
        <input
          type="number"
          value={investAmount}
          onChange={(e) => setInvestAmount(Math.max(0, Number(e.target.value) || 0))}
          className="w-full rounded-xl px-4 py-3 body font-bold tabular-nums border metric-number"
          style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
          min={10000}
          step={10000}
        />
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between body-sm">
          <span style={{ color: 'var(--text-secondary)' }}>예상 보유 수량</span>
          <span className="font-bold tabular-nums" style={{ color: 'var(--text)' }}>{formatQuantity(quantity)}주</span>
        </div>
        <div className="flex justify-between body-sm">
          <span style={{ color: 'var(--text-secondary)' }}>월 배당</span>
          <span className="font-bold tabular-nums text-profit">{formatKrw(monthlyDividend)}</span>
        </div>
        <div className="flex justify-between body-sm">
          <span style={{ color: 'var(--text-secondary)' }}>연 배당</span>
          <span className="font-bold tabular-nums text-profit">{formatKrw(annualDividend)}</span>
        </div>
        <div className="flex justify-between body-sm">
          <span style={{ color: 'var(--text-secondary)' }}>연환산 예상 수익률</span>
          <span className="font-bold tabular-nums" style={{ color: 'var(--royal-blue)' }}>{formatRate(expectedYield)}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onInvestClick?.(investAmount)}
        className="w-full rounded-[20px] py-4 body font-bold tap-scale btn-primary"
      >
        {formatKrw(investAmount)} 매수
      </button>
    </CardV5>
  );
}

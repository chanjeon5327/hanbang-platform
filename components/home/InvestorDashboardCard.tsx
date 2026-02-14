'use client';

import { useEffect } from 'react';
import AssetSummaryCard from './AssetSummaryCard';
import LevelCard from './LevelCard';
import type { AssetData } from './AssetCard';
import { useInvestSummary } from '@/hooks/useInvestSummary';

const TOSS = { secondary: '#6b7684', positive: '#00c48c' } as const;

type Props = {
  data: AssetData | null;
  loading?: boolean;
  isLoggedIn: boolean;
};

export default function InvestorDashboardCard({ data, loading, isLoggedIn }: Props) {
  const { data: investSummary, loading: summaryLoading, refetch } = useInvestSummary(isLoggedIn);

  useEffect(() => {
    const handler = () => refetch();
    window.addEventListener('invest-success', handler);
    return () => window.removeEventListener('invest-success', handler);
  }, [refetch]);

  return (
    <section className="space-y-4">
      <AssetSummaryCard data={data} loading={loading} />
      {isLoggedIn && !summaryLoading && investSummary && (
        <div className="rounded-2xl p-4 border" style={{ backgroundColor: 'var(--toss-card)', borderColor: 'var(--toss-border)' }}>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-[11px] font-medium" style={{ color: TOSS.secondary }}>총 투자금</div>
              <div className="text-[14px] font-bold tabular-nums mt-0.5" style={{ color: 'var(--toss-text)' }}>
                ₩{investSummary.totalInvest >= 10000 ? `${(investSummary.totalInvest / 10000).toFixed(0)}만` : investSummary.totalInvest.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-medium" style={{ color: TOSS.secondary }}>평균 수익률</div>
              <div className="text-[14px] font-bold tabular-nums mt-0.5" style={{ color: investSummary.avgReturnRate >= 0 ? TOSS.positive : 'var(--toss-negative)' }}>
                {investSummary.avgReturnRate >= 0 ? '+' : ''}{investSummary.avgReturnRate}%
              </div>
            </div>
            <div>
              <div className="text-[11px] font-medium" style={{ color: TOSS.secondary }}>이번 달 수익</div>
              <div className="text-[14px] font-bold tabular-nums mt-0.5" style={{ color: TOSS.positive }}>
                +₩{investSummary.monthlyProfit.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}
      <LevelCard level={3} showProgress />
    </section>
  );
}

'use client';

import { useEffect } from 'react';
import AssetSummaryCard from './AssetSummaryCard';
import LevelCard from './LevelCard';
import type { AssetData } from './AssetCard';
import { useInvestSummary } from '@/hooks/useInvestSummary';
import { formatKrw, formatRate } from '@/lib/utils/format';

const ROYAL = { secondary: 'var(--text-secondary)', positive: 'var(--emerald)' } as const;

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
        <div className="rounded-[16px] p-4 border card" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-[11px] font-medium" style={{ color: ROYAL.secondary }}>총 투자금</div>
              <div className="text-[14px] font-bold tabular-nums mt-0.5 metric" style={{ color: 'var(--text)' }}>
                {formatKrw(investSummary.totalInvest)}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-medium" style={{ color: ROYAL.secondary }}>예상 배당 수익률</div>
              <div className="text-[14px] font-bold tabular-nums mt-0.5 metric" style={{ color: investSummary.unrealizedRate >= 0 ? ROYAL.positive : 'var(--accent-loss)' }}>
                {investSummary.unrealizedRate >= 0 ? '+' : ''}{formatRate(investSummary.unrealizedRate)}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-medium" style={{ color: ROYAL.secondary }}>이번 달 배당</div>
              <div className="text-[14px] font-bold tabular-nums mt-0.5 metric text-profit">
                +{formatKrw(investSummary.monthlyProfit)}
              </div>
            </div>
          </div>
        </div>
      )}
      <LevelCard level={3} showProgress />
    </section>
  );
}

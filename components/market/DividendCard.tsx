'use client';

import { formatKrw, formatRate } from '@/lib/utils/format';

type Props = {
  monthlyRevenue?: number;
  dividendRatio?: number;
  dividendPerShare?: number;
  expectedAnnualYield?: number;
};

export default function DividendCard({
  monthlyRevenue = 120_000_000,
  dividendRatio = 0.3,
  dividendPerShare = 360,
  expectedAnnualYield = 8.4,
}: Props) {
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
        배당 시뮬레이션
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-[11px] font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
            월 예상 매출
          </div>
          <div className="text-[15px] font-bold tabular-nums metric" style={{ color: 'var(--text)' }}>
            {formatKrw(monthlyRevenue)}
          </div>
        </div>
        <div>
          <div className="text-[11px] font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
            배당 비율
          </div>
          <div className="text-[15px] font-bold tabular-nums metric" style={{ color: 'var(--royal-blue)' }}>
            {(dividendRatio * 100).toFixed(0)}%
          </div>
        </div>
        <div>
          <div className="text-[11px] font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
            1주당 월 배당
          </div>
          <div className="text-[15px] font-bold tabular-nums metric" style={{ color: 'var(--text)' }}>
            {formatKrw(dividendPerShare)}
          </div>
        </div>
        <div>
          <div className="text-[11px] font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
            연환산 예상 수익률
          </div>
          <div className="text-[18px] font-extrabold tabular-nums metric" style={{ color: 'var(--royal-blue)' }}>
            {formatRate(expectedAnnualYield)}
          </div>
        </div>
      </div>
      <p className="text-[11px] mt-4 pt-4" style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}>
        ※ 시뮬레이션 기반 예상치
      </p>
    </div>
  );
}

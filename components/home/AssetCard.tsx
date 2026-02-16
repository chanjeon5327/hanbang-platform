'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatKrw, formatRate } from '@/lib/utils/format';

const ROYAL = {
  card: 'var(--card)',
  text: 'var(--text)',
  secondary: 'var(--text-secondary)',
  border: 'var(--border)',
  positive: 'var(--emerald)',
  negative: 'var(--accent-loss)',
} as const;

export type AssetData = {
  totalAssets: number;
  userCash: number;
  holdingsValue: number;
  returnAmount: number;
  returnRate: number;
  dailyChange?: number; // 전일 대비 변동 (%)
};

type Props = {
  data: AssetData | null;
  loading?: boolean;
};

function AssetCardSkeleton() {
  return (
    <div
      className="rounded-2xl p-5 border"
      style={{ backgroundColor: ROYAL.card, borderColor: ROYAL.border, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
    >
      <div
        className="h-4 w-16 rounded mb-2"
        style={{
          background: 'linear-gradient(90deg, rgba(0,0,0,0.06) 25%, rgba(0,0,0,0.12) 50%, rgba(0,0,0,0.06) 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
        }}
      />
      <div
        className="h-8 w-40 rounded mb-1"
        style={{
          background: 'linear-gradient(90deg, rgba(0,0,0,0.06) 25%, rgba(0,0,0,0.12) 50%, rgba(0,0,0,0.06) 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
        }}
      />
      <div
        className="h-4 w-24 rounded mb-4"
        style={{
          background: 'linear-gradient(90deg, rgba(0,0,0,0.06) 25%, rgba(0,0,0,0.12) 50%, rgba(0,0,0,0.06) 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
        }}
      />
      <div className="grid grid-cols-2 gap-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i}>
            <div
              className="h-3 w-12 rounded mb-2"
              style={{
                background: 'linear-gradient(90deg, rgba(0,0,0,0.06) 25%, rgba(0,0,0,0.12) 50%, rgba(0,0,0,0.06) 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
              }}
            />
            <div
              className="h-4 w-20 rounded"
              style={{
                background: 'linear-gradient(90deg, rgba(0,0,0,0.06) 25%, rgba(0,0,0,0.12) 50%, rgba(0,0,0,0.06) 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AssetCard({ data, loading }: Props) {
  if (loading || !data) {
    return <AssetCardSkeleton />;
  }

  const { totalAssets, userCash, holdingsValue, returnAmount, returnRate, dailyChange } = data;
  const dailyVal = dailyChange ?? 0;
  const isPositive = returnAmount >= 0;
  const isRatePositive = returnRate >= 0;
  const isDailyPositive = dailyVal > 0;
  const isDailyNegative = dailyVal < 0;

  return (
    <div
      className="rounded-2xl p-5 border"
      style={{ backgroundColor: ROYAL.card, borderColor: ROYAL.border, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
    >
      <div className="body-sm font-medium mb-2" style={{ color: ROYAL.secondary }}>내 자산</div>
      <div className="h2 font-bold tracking-tight tabular-nums" style={{ color: ROYAL.text }}>
        {formatKrw(totalAssets)}
      </div>
      <div className="flex items-baseline gap-2 mt-1">
        <span
          className="body-sm font-semibold tabular-nums"
          style={{ color: isPositive ? ROYAL.positive : ROYAL.negative }}
        >
          {isPositive ? '+' : ''}{formatKrw(returnAmount)}
        </span>
        <span
          className="body-sm font-medium tabular-nums"
          style={{ color: isRatePositive ? ROYAL.positive : ROYAL.negative }}
        >
          ({isRatePositive ? '+' : ''}{formatRate(returnRate)})
        </span>
      </div>
      {/* 오늘 등락률 강조 - API 없으면 0 fallback */}
      <div
        className="flex items-center gap-1.5 mt-2 body-sm font-semibold tabular-nums"
        style={{ color: isDailyPositive ? ROYAL.positive : isDailyNegative ? ROYAL.negative : ROYAL.secondary }}
      >
        {isDailyPositive && <TrendingUp size={14} strokeWidth={2.5} aria-hidden />}
        {isDailyNegative && <TrendingDown size={14} strokeWidth={2.5} aria-hidden />}
        {!isDailyPositive && !isDailyNegative && <Minus size={14} strokeWidth={2.5} aria-hidden />}
        <span>
          오늘 {isDailyPositive ? '+' : ''}{dailyVal.toFixed(1)}% {isDailyPositive ? '상승 중' : isDailyNegative ? '하락 중' : '보합'}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
        <div>
          <div className="caption font-medium" style={{ color: ROYAL.secondary }}>예수금</div>
          <div className="body-sm font-semibold tabular-nums mt-0.5" style={{ color: ROYAL.text }}>{formatKrw(userCash)}</div>
        </div>
        <div>
          <div className="caption font-medium" style={{ color: ROYAL.secondary }}>보유평가</div>
          <div className="body-sm font-semibold tabular-nums mt-0.5" style={{ color: ROYAL.text }}>{formatKrw(holdingsValue)}</div>
        </div>
        <div>
          <div className="caption font-medium" style={{ color: ROYAL.secondary }}>손익</div>
          <div className="body-sm font-semibold tabular-nums mt-0.5" style={{ color: isPositive ? ROYAL.positive : ROYAL.negative }}>
            {isPositive ? '+' : ''}{formatKrw(returnAmount)}
          </div>
        </div>
        <div>
          <div className="caption font-medium" style={{ color: ROYAL.secondary }}>예상 배당 수익률</div>
          <div className="body-sm font-semibold tabular-nums mt-0.5" style={{ color: isRatePositive ? ROYAL.positive : ROYAL.negative }}>
            {isRatePositive ? '+' : ''}{formatRate(returnRate)}
          </div>
        </div>
      </div>
    </div>
  );
}

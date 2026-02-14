'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const TOSS = {
  card: '#ffffff',
  text: '#191f28',
  secondary: '#6b7684',
  border: '#e5e8eb',
  positive: '#00c48c',
  negative: '#eb4d3d',
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
      style={{ backgroundColor: TOSS.card, borderColor: TOSS.border, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
    >
      <div className="h-4 w-16 rounded bg-black/10 animate-pulse mb-2" />
      <div className="h-8 w-40 rounded bg-black/10 animate-pulse mb-1" />
      <div className="h-4 w-24 rounded bg-black/10 animate-pulse mb-4" />
      <div className="grid grid-cols-2 gap-4 pt-4" style={{ borderTop: '1px solid var(--toss-border)' }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i}>
            <div className="h-3 w-12 rounded bg-black/10 animate-pulse mb-2" />
            <div className="h-4 w-20 rounded bg-black/10 animate-pulse" />
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
      style={{ backgroundColor: TOSS.card, borderColor: TOSS.border, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
    >
      <div className="text-[13px] font-medium mb-2" style={{ color: TOSS.secondary }}>내 자산</div>
      <div className="text-[26px] font-bold tracking-tight tabular-nums" style={{ color: TOSS.text }}>
        ₩{totalAssets.toLocaleString()}
      </div>
      <div className="flex items-baseline gap-2 mt-1">
        <span
          className="text-[14px] font-semibold tabular-nums"
          style={{ color: isPositive ? TOSS.positive : TOSS.negative }}
        >
          {isPositive ? '+' : ''}{returnAmount.toLocaleString()}원
        </span>
        <span
          className="text-[13px] font-medium tabular-nums"
          style={{ color: isRatePositive ? TOSS.positive : TOSS.negative }}
        >
          ({isRatePositive ? '+' : ''}{returnRate.toFixed(2)}%)
        </span>
      </div>
      {/* 오늘 등락률 강조 - API 없으면 0 fallback */}
      <div
        className="flex items-center gap-1.5 mt-2 text-[13px] font-semibold tabular-nums"
        style={{ color: isDailyPositive ? TOSS.positive : isDailyNegative ? TOSS.negative : TOSS.secondary }}
      >
        {isDailyPositive && <TrendingUp size={14} strokeWidth={2.5} aria-hidden />}
        {isDailyNegative && <TrendingDown size={14} strokeWidth={2.5} aria-hidden />}
        {!isDailyPositive && !isDailyNegative && <Minus size={14} strokeWidth={2.5} aria-hidden />}
        <span>
          오늘 {isDailyPositive ? '+' : ''}{dailyVal.toFixed(1)}% {isDailyPositive ? '상승 중' : isDailyNegative ? '하락 중' : '보합'}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4 pt-4" style={{ borderTop: '1px solid var(--toss-border)' }}>
        <div>
          <div className="text-[11px] font-medium" style={{ color: TOSS.secondary }}>예수금</div>
          <div className="text-[14px] font-semibold tabular-nums mt-0.5" style={{ color: TOSS.text }}>{userCash.toLocaleString()}원</div>
        </div>
        <div>
          <div className="text-[11px] font-medium" style={{ color: TOSS.secondary }}>보유평가</div>
          <div className="text-[14px] font-semibold tabular-nums mt-0.5" style={{ color: TOSS.text }}>{holdingsValue.toLocaleString()}원</div>
        </div>
        <div>
          <div className="text-[11px] font-medium" style={{ color: TOSS.secondary }}>손익</div>
          <div className="text-[14px] font-semibold tabular-nums mt-0.5" style={{ color: isPositive ? TOSS.positive : TOSS.negative }}>
            {isPositive ? '+' : ''}{returnAmount.toLocaleString()}원
          </div>
        </div>
        <div>
          <div className="text-[11px] font-medium" style={{ color: TOSS.secondary }}>수익률</div>
          <div className="text-[14px] font-semibold tabular-nums mt-0.5" style={{ color: isRatePositive ? TOSS.positive : TOSS.negative }}>
            {isRatePositive ? '+' : ''}{returnRate.toFixed(2)}%
          </div>
        </div>
      </div>
    </div>
  );
}

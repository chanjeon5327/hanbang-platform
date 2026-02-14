'use client';

const TOSS = {
  text: '#191f28',
  secondary: '#6b7684',
  blue: '#3182f6',
  positive: '#00c48c',
  negative: '#eb4d3d',
} as const;

type Props = {
  progress: number;
  targetAmount: number;
  currentAmount: number;
  participants: number;
  remainingAmount: number;
  isLive?: boolean;
  isDeadlineSoon?: boolean;
};

function formatAmount(n: number): string {
  if (n >= 1_0000_0000) return `${(n / 1_0000_0000).toFixed(1)}억`;
  if (n >= 1_0000) return `${(n / 1_0000).toFixed(0)}만`;
  return n.toLocaleString();
}

export default function MarketStatsBar({
  progress,
  targetAmount,
  currentAmount,
  participants,
  remainingAmount,
  isLive = true,
  isDeadlineSoon = false,
}: Props) {
  return (
    <div className="pb-4" style={{ borderBottom: '1px solid var(--upbit-border)' }}>
      {/* 배지 */}
      <div className="flex gap-2 mb-3">
        {isLive && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: TOSS.negative, color: '#fff' }}>
            LIVE
          </span>
        )}
        {isDeadlineSoon && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: TOSS.negative, color: '#fff' }}>
            마감임박
          </span>
        )}
      </div>

      {/* 모집률 - 크게 강조 */}
      <div className="mb-4">
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-[12px]" style={{ color: TOSS.secondary }}>모집률</span>
          <span className="text-[28px] font-extrabold tabular-nums" style={{ color: TOSS.text }}>{progress}%</span>
        </div>
        <div className="w-full rounded-full h-2 overflow-hidden" style={{ backgroundColor: 'var(--upbit-border)' }}>
          <div
            className="h-2 rounded-full transition-all"
            style={{ width: `${Math.min(100, progress)}%`, backgroundColor: TOSS.blue }}
          />
        </div>
      </div>

      {/* 통계 그리드 */}
      <div className="grid grid-cols-2 gap-3 text-[12px]">
        <div>
          <div style={{ color: TOSS.secondary }}>총 모집 금액</div>
          <div className="text-[14px] font-bold tabular-nums" style={{ color: TOSS.text }}>₩{formatAmount(targetAmount)}</div>
        </div>
        <div>
          <div style={{ color: TOSS.secondary }}>현재 참여자</div>
          <div className="text-[14px] font-bold tabular-nums" style={{ color: TOSS.text }}>{participants}명</div>
        </div>
        <div>
          <div style={{ color: TOSS.secondary }}>현재 모집액</div>
          <div className="text-[18px] font-extrabold tabular-nums" style={{ color: TOSS.positive }}>₩{formatAmount(currentAmount)}</div>
        </div>
        <div>
          <div style={{ color: TOSS.secondary }}>남은 금액</div>
          <div className="text-[14px] font-bold tabular-nums" style={{ color: TOSS.text }}>₩{formatAmount(remainingAmount)}</div>
        </div>
      </div>
    </div>
  );
}

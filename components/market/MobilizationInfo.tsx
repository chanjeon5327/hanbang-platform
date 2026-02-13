'use client';

import { useToken } from '@/context/TokenContext';

/**
 * 모집 정보: 모집률, 참여자 수, 남은 시간, 목표 금액
 */
type Props = {
  progress: number; // 0~100
  participants: number;
  remainingText: string;
  targetAmount: number;
  currentAmount: number;
};

export default function MobilizationInfo({ progress, participants, remainingText, targetAmount, currentAmount }: Props) {
  const { formatPrice } = useToken();

  return (
    <section className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--upbit-panel)', borderColor: 'var(--upbit-border)' }}>
      <div className="p-4 space-y-4">
        <div>
          <div className="flex justify-between text-[12px] mb-2">
            <span style={{ color: 'var(--upbit-text-dim)' }}>모집률</span>
            <span className="font-semibold tabular-nums" style={{ color: 'var(--upbit-bid)' }}>{progress}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--upbit-border)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, progress)}%`, backgroundColor: 'var(--upbit-bid)' }}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-[11px]" style={{ color: 'var(--upbit-text-dim)' }}>참여자</div>
            <div className="text-[15px] font-bold tabular-nums" style={{ color: 'var(--upbit-text)' }}>{participants}명</div>
          </div>
          <div>
            <div className="text-[11px]" style={{ color: 'var(--upbit-text-dim)' }}>남은 시간</div>
            <div className="text-[15px] font-bold" style={{ color: 'var(--upbit-text)' }}>{remainingText}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-2" style={{ borderTop: '1px solid var(--upbit-border)' }}>
          <div>
            <div className="text-[11px]" style={{ color: 'var(--upbit-text-dim)' }}>목표 금액</div>
            <div className="text-[14px] font-semibold tabular-nums" style={{ color: 'var(--upbit-text)' }}>{formatPrice(targetAmount)}</div>
          </div>
          <div>
            <div className="text-[11px]" style={{ color: 'var(--upbit-text-dim)' }}>현재 모집</div>
            <div className="text-[14px] font-semibold tabular-nums" style={{ color: 'var(--upbit-bid)' }}>{formatPrice(currentAmount)}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

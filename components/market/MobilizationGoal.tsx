'use client';

import { useToken } from '@/context/TokenContext';
import { Users, Clock } from 'lucide-react';

/**
 * 목표 도달률(프로그레스) / 참여자 / 남은시간
 * 어떻게 참여? - 모집형 전용
 */
type Props = {
  progress: number;
  participants: number;
  remainingText: string;
  targetAmount: number;
  currentAmount: number;
};

export default function MobilizationGoal({ progress, participants, remainingText, targetAmount, currentAmount }: Props) {
  const { formatPrice } = useToken();

  return (
    <section className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--upbit-panel)', borderColor: 'var(--upbit-border)' }}>
      <h3 className="px-4 py-3 font-bold body border-b" style={{ color: 'var(--upbit-text)', borderColor: 'var(--upbit-border)' }}>
        모집 현황
      </h3>
      <div className="p-4 space-y-4">
        {/* 목표 도달률 프로그레스 */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="caption" style={{ color: 'var(--upbit-text-dim)' }}>목표 도달률</span>
            <span className="body font-bold tabular-nums" style={{ color: 'var(--upbit-bid)' }}>{progress}%</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--upbit-border)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, progress)}%`, backgroundColor: 'var(--upbit-bid)' }}
            />
          </div>
          <div className="flex justify-between caption mt-1" style={{ color: 'var(--upbit-text-dim)' }}>
            <span>{formatPrice(currentAmount)}</span>
            <span>{formatPrice(targetAmount)}</span>
          </div>
        </div>

        {/* 참여자 / 남은시간 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: 'var(--upbit-bg)' }}>
            <Users size={18} style={{ color: 'var(--upbit-bid)' }} />
            <div>
              <div className="caption" style={{ color: 'var(--upbit-text-dim)' }}>참여자</div>
              <div className="body font-bold tabular-nums" style={{ color: 'var(--upbit-text)' }}>{participants}명</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: 'var(--upbit-bg)' }}>
            <Clock size={18} style={{ color: 'var(--upbit-ask)' }} />
            <div>
              <div className="caption" style={{ color: 'var(--upbit-text-dim)' }}>남은 시간</div>
              <div className="body font-bold" style={{ color: 'var(--upbit-text)' }}>{remainingText}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

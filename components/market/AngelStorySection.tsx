'use client';

import { Check, AlertTriangle } from 'lucide-react';

type Props = {
  creatorStory?: string | null;
  growthReason1?: string | null;
  growthReason2?: string | null;
  growthReason3?: string | null;
};

const DEFAULT_STORY = '이 IP는 유튜브·OTT·굿즈 등 다채널 수익 모델로 성장 잠재력이 높습니다.';
const DEFAULT_REASONS = [
  '구독자·시청 수 꾸준한 성장',
  '해외 진출 및 라이선싱 확대',
  '멤버십·후원 등 안정적 수익원',
];

export default function AngelStorySection({
  creatorStory = DEFAULT_STORY,
  growthReason1 = DEFAULT_REASONS[0],
  growthReason2 = DEFAULT_REASONS[1],
  growthReason3 = DEFAULT_REASONS[2],
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
        왜 이 IP인가
      </h3>
      <p className="text-[14px] leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
        {creatorStory}
      </p>

      <h4 className="text-[13px] font-semibold mb-3" style={{ color: 'var(--text)' }}>
        성장 근거
      </h4>
      <ul className="space-y-2 mb-6">
        {[growthReason1, growthReason2, growthReason3].map((r, i) => (
          <li key={i} className="flex items-start gap-2 text-[13px]" style={{ color: 'var(--text-secondary)' }}>
            <Check size={16} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--emerald)' }} />
            <span>{r}</span>
          </li>
        ))}
      </ul>

      <div
        className="rounded-xl p-4 flex gap-2"
        style={{ backgroundColor: 'rgba(220, 38, 38, 0.08)', border: '1px solid rgba(220, 38, 38, 0.2)' }}
      >
        <AlertTriangle size={18} className="flex-shrink-0" style={{ color: 'var(--accent-loss)' }} />
        <div className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--accent-loss)' }}>리스크 고지:</strong> 배당은 실제 수익에 따라 변동될 수 있으며, 원금 손실 가능성이 있습니다.
        </div>
      </div>

      <div className="mt-6 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
        <h4 className="text-[13px] font-semibold mb-2" style={{ color: 'var(--text)' }}>
          배당 구조
        </h4>
        <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
          월 매출의 30%를 배당 풀에 적립 후, 보유 지분 비율에 따라 매월 분배합니다. 지급일은 매월 3일입니다.
        </p>
      </div>
    </div>
  );
}

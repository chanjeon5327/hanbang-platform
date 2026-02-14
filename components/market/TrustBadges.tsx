'use client';

import { Shield, CheckCircle, UserCheck, FileText } from 'lucide-react';

const BADGES = [
  { icon: Shield, label: '원장 불변성 보장' },
  { icon: CheckCircle, label: '정산 완료 N건' },
  { icon: UserCheck, label: '실명 인증 크리에이터' },
  { icon: FileText, label: '감사 로그 기록' },
] as const;

type Props = {
  settlementCount?: number;
};

export default function TrustBadges({ settlementCount = 127 }: Props) {
  const labels = [...BADGES].map((b) =>
    b.label === '정산 완료 N건' ? `정산 완료 ${settlementCount}건` : b.label
  );

  return (
    <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--upbit-panel)', borderColor: 'var(--upbit-border)' }}>
      <h3 className="text-[13px] font-bold mb-3" style={{ color: 'var(--upbit-text)' }}>투자 신뢰 요소</h3>
      <div className="grid grid-cols-2 gap-2">
        {BADGES.map((b, i) => (
          <div key={b.label} className="flex items-center gap-2 py-2">
            <b.icon size={18} strokeWidth={2} style={{ color: 'var(--upbit-bid)' }} />
            <span className="text-[12px] font-medium" style={{ color: 'var(--upbit-text)' }}>{labels[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

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
    <div className="rounded-3xl p-4" style={{ backgroundColor: 'var(--primary)' }}>
      <h3 className="body-sm font-bold mb-3 text-white">투자 신뢰 요소</h3>
      <div className="grid grid-cols-2 gap-2">
        {BADGES.map((b, i) => (
          <div key={b.label} className="flex items-center gap-2 py-2">
            <b.icon size={18} strokeWidth={2} className="text-white" />
            <span className="caption font-medium text-white">{labels[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

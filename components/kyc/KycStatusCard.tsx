'use client';

export type KycStatus = 'NOT_STARTED' | 'PENDING' | 'APPROVED' | 'REJECTED';

const LABELS: Record<KycStatus, string> = {
  NOT_STARTED: '심사 전',
  PENDING: '심사 중',
  APPROVED: '승인',
  REJECTED: '반려',
};

const DESCRIPTIONS: Record<KycStatus, string> = {
  NOT_STARTED: '본인인증 정보를 입력하고 제출해주세요.',
  PENDING: '제출이 완료되었습니다. 1~2 영업일 내 심사가 완료됩니다.',
  APPROVED: '본인인증이 완료되었습니다. 출금 및 고액거래가 가능합니다.',
  REJECTED: '심사 결과 반려되었습니다. 아래 사유를 확인 후 재제출해주세요.',
};

type Props = {
  status: KycStatus;
  reason?: string | null;
};

export default function KycStatusCard({ status, reason }: Props) {
  const isRejected = status === 'REJECTED';
  const isApproved = status === 'APPROVED';
  const isPending = status === 'PENDING';

  const badgeBg =
    isApproved ? 'var(--emerald)' :
    isRejected ? 'var(--accent-loss)' :
    isPending ? 'var(--royal-blue)' :
    'var(--border)';

  const badgeColor = isApproved || isRejected || isPending ? '#fff' : 'var(--text-secondary)';

  return (
    <div
      className="rounded-2xl p-4"
      style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center gap-3 mb-2">
        <span
          className="px-2.5 py-1 rounded-full caption font-semibold"
          style={{ backgroundColor: badgeBg, color: badgeColor }}
        >
          {LABELS[status]}
        </span>
      </div>
      <p className="body-sm" style={{ color: 'var(--text)' }}>
        {DESCRIPTIONS[status]}
      </p>
      {isRejected && (
        <p className="body-sm mt-2" style={{ color: 'var(--accent-loss)' }}>
          {reason?.trim() || '제출된 정보를 확인할 수 없습니다. 다시 시도해주세요.'}
        </p>
      )}
    </div>
  );
}

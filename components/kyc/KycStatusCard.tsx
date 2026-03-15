'use client';

export type KycStatus = 'NOT_STARTED' | 'PENDING' | 'APPROVED' | 'REJECTED';

const LABELS: Record<KycStatus, string> = {
  NOT_STARTED: '시작 전',
  PENDING: '확인 중',
  APPROVED: '완료',
  REJECTED: '보완 필요',
};

const DESCRIPTIONS: Record<KycStatus, string> = {
  NOT_STARTED: '아래 정보를 입력하고 제출해주세요. 금방 끝나요.',
  PENDING: '제출이 완료되었어요. 1~2 영업일 내에 확인해 드릴게요.',
  APPROVED: '인증이 완료되었어요. 출금과 고액거래가 가능해요.',
  REJECTED: '아래 내용을 확인한 뒤 다시 제출해주세요.',
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
      className="rounded-2xl px-4 py-3 flex items-start gap-3"
      style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
    >
      <span
        className="mt-0.5 shrink-0 px-2.5 py-1 rounded-full caption font-semibold"
        style={{ backgroundColor: badgeBg, color: badgeColor }}
      >
        {LABELS[status]}
      </span>
      <div className="min-w-0">
        <p className="body-sm" style={{ color: 'var(--text)' }}>
          {DESCRIPTIONS[status]}
        </p>
        {isRejected && (
          <p className="body-sm mt-1" style={{ color: 'var(--accent-loss)' }}>
            {reason?.trim() || '제출된 정보를 확인할 수 없어요. 다시 시도해주세요.'}
          </p>
        )}
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useKycStatus, type KycStatus } from '@/hooks/useKycStatus';

type Props = {
  compact?: boolean;
};

export default function KycGateBanner({ compact }: Props) {
  const { status, reason, loading } = useKycStatus();

  if (loading || status === 'APPROVED') return null;

  const content = (() => {
    switch (status) {
      case 'NOT_STARTED':
        return (
          <>
            <p className="font-semibold" style={{ color: 'var(--text)', fontSize: compact ? 14 : 15 }}>
              인증이 필요해요
            </p>
            <p className="mt-0.5 body-sm" style={{ color: 'var(--text-secondary)' }}>
              출금과 거래를 위해 간단한 인증을 완료해주세요. 금방 끝나요.
            </p>
            <Link
              href="/kyc"
              className="inline-block mt-3 px-4 py-2 rounded-xl font-semibold body-sm"
              style={{ backgroundColor: 'var(--royal-blue)', color: '#fff' }}
            >
              인증하기
            </Link>
          </>
        );
      case 'PENDING':
        return (
          <>
            <p className="font-semibold" style={{ color: 'var(--text)', fontSize: compact ? 14 : 15 }}>
              확인 중이에요
            </p>
            <p className="mt-0.5 body-sm" style={{ color: 'var(--text-secondary)' }}>
              1~2 영업일 내에 확인해 드릴게요. 완료되면 출금·거래가 가능해요.
            </p>
          </>
        );
      case 'REJECTED':
        return (
          <>
            <p className="font-semibold" style={{ color: 'var(--text)', fontSize: compact ? 14 : 15 }}>
              보완이 필요해요
            </p>
            {reason?.trim() && (
              <p className="mt-0.5 body-sm" style={{ color: 'var(--accent-loss)' }}>
                {reason}
              </p>
            )}
            <Link
              href="/kyc"
              className="inline-block mt-3 px-4 py-2 rounded-xl font-semibold body-sm"
              style={{ backgroundColor: 'var(--royal-blue)', color: '#fff' }}
            >
              다시 제출하기
            </Link>
          </>
        );
      default:
        return null;
    }
  })();

  if (!content) return null;

  return (
    <div
      className={`rounded-2xl p-4 ${compact ? '' : 'mb-4'}`}
      style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
    >
      {content}
    </div>
  );
}

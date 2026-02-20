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
              KYC 인증이 필요합니다
            </p>
            <p className="mt-0.5 body-sm" style={{ color: 'var(--text-secondary)' }}>
              출금 및 거래를 위해 본인인증을 완료해주세요.
            </p>
            <Link
              href="/kyc"
              className="inline-block mt-3 px-4 py-2 rounded-xl font-semibold body-sm"
              style={{ backgroundColor: 'var(--royal-blue)', color: '#fff' }}
            >
              KYC 하러가기
            </Link>
          </>
        );
      case 'PENDING':
        return (
          <>
            <p className="font-semibold" style={{ color: 'var(--text)', fontSize: compact ? 14 : 15 }}>
              심사 중입니다
            </p>
            <p className="mt-0.5 body-sm" style={{ color: 'var(--text-secondary)' }}>
              1~2 영업일 내 심사가 완료됩니다. 완료 시 출금·거래가 가능합니다.
            </p>
          </>
        );
      case 'REJECTED':
        return (
          <>
            <p className="font-semibold" style={{ color: 'var(--text)', fontSize: compact ? 14 : 15 }}>
              반려되었습니다
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
              다시 제출
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

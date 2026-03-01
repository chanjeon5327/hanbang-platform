'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import KycStatusCard, { type KycStatus } from '@/components/kyc/KycStatusCard';
import KycForm from '@/components/kyc/KycForm';

function parseKycStatus(data: Record<string, unknown> | null): { status: KycStatus; reason?: string } {
  if (!data) return { status: 'NOT_STARTED' };

  const verification = data.verification as Record<string, unknown> | undefined;
  const raw = String(data.kyc_status ?? data.user_status ?? verification?.status ?? '').toLowerCase();
  const verificationStatus = String(verification?.status ?? '').toLowerCase();
  const userStatus = String(data.user_status ?? '').toUpperCase();
  const reason = verification?.rejection_reason as string | undefined;

  if (
    raw.includes('approved') ||
    verificationStatus.includes('approved') ||
    raw === 'approved'
  ) {
    return { status: 'APPROVED' };
  }
  if (
    raw.includes('reject') ||
    raw.includes('denied') ||
    verificationStatus.includes('reject') ||
    verificationStatus.includes('denied')
  ) {
    return { status: 'REJECTED', reason };
  }
  if (
    raw.includes('pending') ||
    raw.includes('submitted') ||
    verificationStatus.includes('submitted') ||
    verificationStatus.includes('in_review') ||
    userStatus === 'KYC_SUBMITTED'
  ) {
    return { status: 'PENDING', reason };
  }

  return { status: 'NOT_STARTED' };
}

const STEPS = [
  '1) 본인 정보 입력',
  '2) 제출',
  '3) 심사 완료',
];

export default function KycPage() {
  const [status, setStatus] = useState<KycStatus>('NOT_STARTED');
  const [reason, setReason] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/kyc/status', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const parsed = parseKycStatus(d);
        setStatus(parsed.status);
        setReason(parsed.reason);
      })
      .catch(() => setStatus('NOT_STARTED'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmitted = () => {
    setStatus('PENDING');
  };

  return (
    <div className="pb-24" style={{ backgroundColor: 'var(--bg)' }}>
      <header
        className="sticky top-0 z-50 border-b px-4 py-3"
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center justify-between">
          <Link href="/mypage" className="body-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            ‹ 마이페이지
          </Link>
          <h1 className="body-lg font-bold" style={{ color: 'var(--text)' }}>
            KYC 인증
          </h1>
          <span className="w-14" />
        </div>
      </header>

      <div className="px-4 py-6 mx-auto max-w-[480px]">
        {loading ? (
          <div
            className="rounded-2xl p-4 h-24 animate-pulse"
            style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
          />
        ) : (
          <KycStatusCard status={status} reason={reason} />
        )}

        <div className="mt-6 mb-6">
          <h3 className="font-semibold mb-3" style={{ fontSize: 14, color: 'var(--text)' }}>
            진행 단계
          </h3>
          <ul className="space-y-2">
            {STEPS.map((s) => (
              <li key={s} className="body-sm" style={{ color: 'var(--text-secondary)' }}>
                {s}
              </li>
            ))}
          </ul>
        </div>

        {status !== 'APPROVED' && !loading && <KycForm onSubmitted={handleSubmitted} />}

        <p className="mt-6 caption text-center" style={{ color: 'var(--text-secondary)' }}>
          승인 후 출금/고액거래 한도 상향
        </p>
      </div>
    </div>
  );
}

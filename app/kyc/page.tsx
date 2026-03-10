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
    <div className="pb-16" style={{ backgroundColor: 'var(--bg)' }}>
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

      <div className="px-4 pt-4 pb-4 mx-auto max-w-[480px] space-y-4">
        {loading ? (
          <div
            className="rounded-2xl p-4 h-16 animate-pulse"
            style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
          />
        ) : (
          <KycStatusCard status={status} reason={reason} />
        )}

        {/* 진행 단계: 인라인 pill 형태로 compact */}
        <div className="flex items-center gap-2 flex-wrap">
          {STEPS.map((s, i) => (
            <span
              key={s}
              className="inline-flex items-center gap-1 rounded-full px-3 py-1 caption font-medium"
              style={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
              }}
            >
              <span
                className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{ backgroundColor: 'var(--royal-blue)' }}
              >
                {i + 1}
              </span>
              {s.replace(/^\d+\)\s*/, '')}
            </span>
          ))}
        </div>

        {status !== 'APPROVED' && !loading && <KycForm onSubmitted={handleSubmitted} />}

        <p className="caption text-center" style={{ color: 'var(--text-secondary)' }}>
          승인 후 출금/고액거래 한도 상향
        </p>
      </div>
    </div>
  );
}

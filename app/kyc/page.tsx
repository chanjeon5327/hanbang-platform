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
  { label: '기본 정보', short: '기본' },
  { label: '신분 확인', short: '신분' },
  { label: '연락 정보', short: '연락' },
  { label: '완료', short: '완료' },
];

function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div
          key={i}
          className="h-1.5 flex-1 rounded-full transition-colors"
          style={{
            backgroundColor: i < currentStep ? 'var(--royal-blue)' : 'var(--border)',
          }}
        />
      ))}
    </div>
  );
}

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

  const progressStep =
    status === 'APPROVED' ? 4 : status === 'PENDING' ? 4 : status === 'REJECTED' ? 1 : 1;

  return (
    <div className="pb-16 min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <header
        className="sticky top-0 z-50 border-b px-4 py-3"
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center justify-between">
          <Link href="/mypage" className="body-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            ‹ 마이페이지
          </Link>
          <h1 className="body-lg font-bold" style={{ color: 'var(--text)' }}>
            인증하기
          </h1>
          <span className="w-14" />
        </div>
      </header>

      <div className="px-4 pt-4 pb-4 mx-auto max-w-[480px] space-y-5">
        {/* 첫 화면: 부드러운 진입 안내 (NOT_STARTED 또는 REJECTED일 때) */}
        {(status === 'NOT_STARTED' || status === 'REJECTED') && !loading && (
          <div
            className="rounded-2xl p-5"
            style={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
            }}
          >
            <p className="font-semibold mb-1" style={{ fontSize: 17, color: 'var(--text)' }}>
              안전한 거래를 위해 간단한 인증이 필요해요
            </p>
            <p className="body-sm" style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              몇 단계만 거치면 바로 이용할 수 있어요. 금방 끝나요 ✨
            </p>
          </div>
        )}

        {loading ? (
          <div
            className="rounded-2xl p-4 h-20 animate-pulse"
            style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
          />
        ) : (
          <KycStatusCard status={status} reason={reason} />
        )}

        {/* 진행률 표시 */}
        {status !== 'APPROVED' && !loading && (
          <div className="space-y-2">
            <div className="flex justify-between caption" style={{ color: 'var(--text-secondary)' }}>
              <span>
                {status === 'PENDING' ? '제출 완료!' : `${STEPS[progressStep - 1]?.label ?? ''} 단계`}
              </span>
              <span>
                {status === 'PENDING' ? '확인 중이에요' : `${progressStep}/${STEPS.length}`}
              </span>
            </div>
            <StepIndicator currentStep={progressStep} totalSteps={STEPS.length} />
          </div>
        )}

        {status !== 'APPROVED' && !loading && <KycForm onSubmitted={handleSubmitted} />}

        {status !== 'APPROVED' && !loading && (
          <p className="caption text-center" style={{ color: 'var(--text-secondary)' }}>
            인증 완료 후 출금·고액거래가 가능해요
          </p>
        )}
      </div>
    </div>
  );
}

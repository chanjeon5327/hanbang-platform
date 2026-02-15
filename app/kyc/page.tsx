'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Check, Upload, Shield } from 'lucide-react';

const STEPS = ['본인인증', '신분증 업로드', '승인 대기'];

export default function KycPage() {
  const [step, setStep] = useState(0);
  const [uploaded, setUploaded] = useState(false);
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/kyc/status', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.kyc_status) setKycStatus(d.kyc_status);
        if (d?.submissions?.[0]?.status) setStatus(d.submissions[0].status);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <header className="sticky top-0 z-50 border-b px-4 py-3" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/mypage" className="text-[14px] font-medium" style={{ color: 'var(--text-secondary)' }}>
            ← 뒤로
          </Link>
          <h1 className="text-[17px] font-bold" style={{ color: 'var(--text)' }}>엔젤 KYC 인증</h1>
          <span className="w-14" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="rounded-[16px] p-4 mb-6" style={{ backgroundColor: 'rgba(30, 58, 138, 0.08)', border: '1px solid rgba(30, 58, 138, 0.2)' }}>
          <p className="text-[13px]" style={{ color: 'var(--text)' }}>
            <strong>KYC가 왜 필요한가요?</strong> 엔젤 투자 시 금융당국 규정에 따라 본인 확인이 필요합니다. 안전한 투자 환경을 위해 최소한의 정보만 수집합니다.
          </p>
        </div>
        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className="flex-1 h-2 rounded-full"
              style={{
                backgroundColor: i <= step ? 'var(--royal-blue)' : 'var(--border)',
              }}
            />
          ))}
        </div>
        <p className="text-[13px] mb-6" style={{ color: 'var(--text-secondary)' }}>
          {STEPS[step]}
        </p>

        {/* Step Cards */}
        <div className="space-y-6">
          <div
            className="rounded-[16px] p-6 border card tap-scale cursor-pointer"
            onClick={() => setStep(0)}
            style={{
              borderColor: step === 0 ? 'var(--royal-blue)' : 'var(--border)',
              borderWidth: step === 0 ? 2 : 1,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--royal-blue)', color: '#fff' }}
              >
                <Shield size={20} />
              </div>
              <div>
                <h3 className="text-[15px] font-bold" style={{ color: 'var(--text)' }}>본인인증</h3>
                <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>휴대폰 본인확인</p>
              </div>
              {step > 0 && <Check size={20} style={{ color: 'var(--emerald)', marginLeft: 'auto' }} />}
            </div>
          </div>

          <div
            className="rounded-[16px] p-6 border card tap-scale cursor-pointer"
            onClick={() => setStep(1)}
            style={{
              borderColor: step === 1 ? 'var(--royal-blue)' : 'var(--border)',
              borderWidth: step === 1 ? 2 : 1,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--royal-blue)', color: '#fff' }}
              >
                <Upload size={20} />
              </div>
              <div>
                <h3 className="text-[15px] font-bold" style={{ color: 'var(--text)' }}>신분증 업로드</h3>
                <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                  {uploaded ? '업로드 완료' : '주민등록증 또는 운전면허증'}
                </p>
              </div>
              {uploaded && <Check size={20} style={{ color: 'var(--emerald)', marginLeft: 'auto' }} />}
            </div>
            {step === 1 && (
              <div
                className="mt-4 p-6 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2"
                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                onClick={(e) => { e.stopPropagation(); setUploaded(true); }}
              >
                <Upload size={32} />
                <span className="text-[13px]">클릭하여 업로드</span>
              </div>
            )}
          </div>

          <div
            className="rounded-[16px] p-6 border card"
            style={{
              borderColor: step === 2 ? 'var(--royal-blue)' : 'var(--border)',
              borderWidth: step === 2 ? 2 : 1,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--royal-blue)', color: '#fff' }}
              >
                <Check size={20} />
              </div>
              <div>
                <h3 className="text-[15px] font-bold" style={{ color: 'var(--text)' }}>승인 상태</h3>
                <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                  {status === 'approved' ? '엔젤 등록 완료' : status === 'rejected' ? '검토 필요' : '승인 대기 중'}
                </p>
              </div>
              {status === 'approved' && (
                <span
                  className="ml-auto text-[11px] font-bold px-2 py-1 rounded"
                  style={{ backgroundColor: 'rgba(5, 150, 105, 0.2)', color: 'var(--emerald)' }}
                >
                  완료
                </span>
              )}
            </div>
          </div>
        </div>

        {kycStatus && (
          <p className="text-[12px] mb-2" style={{ color: 'var(--text-secondary)' }}>
            KYC 상태: {kycStatus}
          </p>
        )}
        <button
          type="button"
          disabled={submitting}
          onClick={async () => {
            setSubmitting(true);
            try {
              await fetch('/api/kyc/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ step: `step${step + 1}`, payload: { uploaded } }),
              });
            } finally {
              setSubmitting(false);
            }
          }}
          className="w-full mt-8 py-4 rounded-[16px] font-bold tap-scale disabled:opacity-60"
          style={{
            backgroundColor: 'var(--royal-blue)',
            color: '#fff',
            boxShadow: 'var(--shadow-royal)',
          }}
        >
          {submitting ? '제출 중…' : '엔젤 등록 완료'}
        </button>
      </main>
    </div>
  );
}

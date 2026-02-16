'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Check, Upload, Shield } from 'lucide-react';

const STEPS = ['본인인증', '신분증 업로드', '승인 대기'];

export default function KycPage() {
  const [step, setStep] = useState(0);
  const [realName, setRealName] = useState('');
  const [phone, setPhone] = useState('');
  const [idCardFrontUrl, setIdCardFrontUrl] = useState('');
  const [idCardBackUrl, setIdCardBackUrl] = useState('');
  const [userStatus, setUserStatus] = useState<string | null>(null);
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/kyc/status', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.user_status) setUserStatus(d.user_status);
        if (d?.kyc_status) setKycStatus(d.kyc_status);
        if (d?.verification?.rejection_reason) setRejectionReason(d.verification.rejection_reason);
      })
      .catch(() => {});
  }, []);

  const isSubmitted = userStatus === 'KYC_SUBMITTED';
  const isApproved = kycStatus === 'APPROVED';

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

        {rejectionReason && (
          <div className="rounded-[12px] p-3 mb-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <p className="text-[13px]" style={{ color: 'var(--accent-loss)' }}>반려 사유: {rejectionReason}</p>
          </div>
        )}

        {isSubmitted && !isApproved && (
          <div className="rounded-[12px] p-4 mb-6" style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.3)' }}>
            <p className="text-[14px] font-medium" style={{ color: 'var(--text)' }}>승인 대기 중입니다.</p>
            <p className="text-[12px] mt-1" style={{ color: 'var(--text-secondary)' }}>검토 후 이메일로 알려드립니다.</p>
          </div>
        )}

        {isApproved && (
          <div className="rounded-[12px] p-4 mb-6" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
            <p className="text-[14px] font-medium" style={{ color: 'var(--emerald)' }}>KYC 승인 완료</p>
            <Link href="/onboarding" className="text-[13px] mt-2 block" style={{ color: 'var(--royal-blue)' }}>온보딩 진행 →</Link>
          </div>
        )}

        {!isSubmitted && !isApproved && (
          <>
            <div className="flex gap-2 mb-8">
              {STEPS.map((s, i) => (
                <div key={s} className="flex-1 h-2 rounded-full" style={{ backgroundColor: i <= step ? 'var(--royal-blue)' : 'var(--border)' }} />
              ))}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[13px] mb-1" style={{ color: 'var(--text-secondary)' }}>실명 *</label>
                <input
                  type="text"
                  value={realName}
                  onChange={(e) => setRealName(e.target.value)}
                  placeholder="홍길동"
                  className="w-full px-4 py-3 rounded-[12px] border"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                />
              </div>
              <div>
                <label className="block text-[13px] mb-1" style={{ color: 'var(--text-secondary)' }}>연락처</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="010-1234-5678"
                  className="w-full px-4 py-3 rounded-[12px] border"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                />
              </div>
              <div>
                <label className="block text-[13px] mb-1" style={{ color: 'var(--text-secondary)' }}>신분증 앞면 URL (테스트용)</label>
                <input
                  type="url"
                  value={idCardFrontUrl}
                  onChange={(e) => setIdCardFrontUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-3 rounded-[12px] border"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                />
              </div>
              <div>
                <label className="block text-[13px] mb-1" style={{ color: 'var(--text-secondary)' }}>신분증 뒷면 URL (테스트용)</label>
                <input
                  type="url"
                  value={idCardBackUrl}
                  onChange={(e) => setIdCardBackUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-3 rounded-[12px] border"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                />
              </div>
            </div>

            <button
              type="button"
              disabled={submitting || !realName.trim()}
              onClick={async () => {
                setSubmitting(true);
                try {
                  const res = await fetch('/api/kyc/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      real_name: realName.trim(),
                      phone: phone || null,
                      id_card_front_url: idCardFrontUrl || null,
                      id_card_back_url: idCardBackUrl || null,
                    }),
                  });
                  const json = await res.json();
                  if (json.ok) {
                    setUserStatus('KYC_SUBMITTED');
                  } else {
                    alert(json.error ?? '제출 실패');
                  }
                } finally {
                  setSubmitting(false);
                }
              }}
              className="w-full mt-8 py-4 rounded-[16px] font-bold tap-scale disabled:opacity-60"
              style={{ backgroundColor: 'var(--royal-blue)', color: '#fff', boxShadow: 'var(--shadow-royal)' }}
            >
              {submitting ? '제출 중…' : '제출하기'}
            </button>
          </>
        )}
      </main>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import KycGateBanner from '@/components/kyc/KycGateBanner';
import { useKycStatus } from '@/hooks/useKycStatus';

export default function WithdrawPage() {
  const router = useRouter();
  const { isApproved } = useKycStatus();
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const handleWithdrawClick = () => {
    if (!isApproved) {
      setToast('KYC 인증이 필요합니다. KYC 페이지로 이동합니다.');
      setTimeout(() => router.push('/kyc'), 500);
      return;
    }
    setToast('출금 기능은 준비 중입니다.');
  };

  return (
    <div style={{ backgroundColor: 'var(--bg)' }}>
      <header
        className="sticky top-0 z-50 border-b px-4 py-3 flex items-center"
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <Link href="/wallet" className="text-sm" style={{ color: 'var(--text-secondary)' }}>‹ 뒤로</Link>
        <h1 className="flex-1 text-center body font-bold" style={{ color: 'var(--text)' }}>KRW 출금</h1>
        <span className="w-6" />
      </header>
      <div className="px-4 py-6 max-w-[480px] mx-auto">
        <KycGateBanner />
        <div
          className="rounded-2xl border p-6 text-center"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <p className="body" style={{ color: 'var(--text)' }}>출금 기능은 준비 중입니다.</p>
          <p className="body-sm mt-2" style={{ color: 'var(--text-secondary)' }}>곧 업데이트될 예정입니다.</p>
          <button
            type="button"
            onClick={handleWithdrawClick}
            disabled={!isApproved}
            className="mt-4 px-6 py-3 rounded-2xl font-semibold disabled:opacity-50"
            style={{ backgroundColor: 'var(--royal-blue)', color: '#fff' }}
          >
            출금하기
          </button>
        </div>
      </div>
      {toast && (
        <div
          className="fixed bottom-4 left-4 right-4 max-w-md mx-auto py-2 px-4 rounded-xl text-center body-sm font-medium z-50"
          style={{ backgroundColor: 'var(--royal-blue)', color: '#fff' }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}

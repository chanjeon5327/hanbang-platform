'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

/**
 * 결제 confirm 후 1.5초 success 화면
 * "투자 확정 완료" 표시 후 자동 /active-invest 이동
 */
export default function InvestSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    window.dispatchEvent(new Event('wallet-refresh'));
    const t = setTimeout(() => {
      router.replace('/active-invest');
    }, 1500);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center px-4" style={{ backgroundColor: 'var(--upbit-bg)' }}>
      <CheckCircle size={64} className="text-emerald-500 mb-4" strokeWidth={2} />
      <h1 className="h3 font-bold" style={{ color: 'var(--upbit-text)' }}>
        투자 확정 완료
      </h1>
      <p className="body-sm mt-2" style={{ color: 'var(--upbit-text-dim)' }}>
        투자 현황으로 이동합니다...
      </p>
    </div>
  );
}

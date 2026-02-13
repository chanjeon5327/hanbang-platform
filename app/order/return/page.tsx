'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';

/**
 * KCP 결제 후 리턴 URL
 * - KCP가 order_id, tno(pg_transaction_id) 등 쿼리로 리다이렉트
 * - confirm API 호출 후 success로 이동
 */
function ReturnContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('order_id') ?? searchParams.get('ordr_no') ?? '';
  const pgTransactionId = searchParams.get('pg_transaction_id') ?? searchParams.get('tno') ?? searchParams.get('tid') ?? '';

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId || !pgTransactionId) {
      setStatus('error');
      setError('결제 정보가 없습니다.');
      return;
    }

    const confirm = async () => {
      try {
        const res = await fetch('/api/payments/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order_id: orderId,
            pg_transaction_id: pgTransactionId,
          }),
        });
        const json = await res.json();
        if (json.ok) {
          setStatus('success');
          router.replace(`/order/success?order_id=${orderId}`);
        } else {
          setStatus('error');
          setError(json.error || '결제 확정 실패');
        }
      } catch (e) {
        setStatus('error');
        setError('오류가 발생했습니다.');
      }
    };

    confirm();
  }, [orderId, pgTransactionId, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--upbit-bg)' }}>
        <div className="text-center">
          <p className="text-lg" style={{ color: 'var(--upbit-text)' }}>결제 확인 중…</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--upbit-bg)' }}>
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => router.push('/market')}
            className="px-4 py-2 rounded-lg"
            style={{ backgroundColor: 'var(--upbit-bid)', color: '#fff' }}
          >
            마켓으로
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--upbit-bg)' }}>
      <div className="text-center">
        <p className="text-lg" style={{ color: 'var(--upbit-text)' }}>결제 완료, 성공 페이지로 이동합니다…</p>
      </div>
    </div>
  );
}

export default function ReturnPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">로딩…</div>}>
      <ReturnContent />
    </Suspense>
  );
}

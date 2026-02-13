'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';

/**
 * 결제 페이지 (테스트 모드)
 * - KCP 테스트: redirect_url로 진입
 * - 결제 1건 시뮬레이션 후 confirm → success
 */
function PayContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('order_id') ?? '';
  const amount = Number(searchParams.get('amount') ?? 0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTestPay = async () => {
    if (!orderId) {
      setError('order_id가 없습니다.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const pgTransactionId = `test-${Date.now()}`;
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
        router.push(`/order/success?order_id=${orderId}`);
      } else {
        setError(json.error || '결제 확정 실패');
      }
    } catch (e) {
      setError('오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-500">잘못된 접근입니다. order_id가 없습니다.</p>
          <button
            onClick={() => router.push('/market')}
            className="mt-4 px-4 py-2 bg-gray-200 rounded"
          >
            마켓으로
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--upbit-bg)' }}>
      <div className="w-full max-w-md rounded-2xl border p-8" style={{ backgroundColor: 'var(--upbit-panel)', borderColor: 'var(--upbit-border)' }}>
        <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--upbit-text)' }}>결제 테스트</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--upbit-text-dim)' }}>
          KCP 테스트 모드입니다. 결제 완료 버튼을 누르면 확정됩니다.
        </p>
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span style={{ color: 'var(--upbit-text-dim)' }}>주문 ID</span>
            <span className="font-mono text-xs" style={{ color: 'var(--upbit-text)' }}>{orderId.slice(0, 8)}…</span>
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: 'var(--upbit-text-dim)' }}>결제 금액</span>
            <span className="font-bold tabular-nums" style={{ color: 'var(--upbit-text)' }}>{amount.toLocaleString()}원</span>
          </div>
        </div>
        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
        <button
          onClick={handleTestPay}
          disabled={loading}
          className="w-full py-3.5 rounded-lg text-white text-[16px] font-semibold disabled:opacity-60"
          style={{ backgroundColor: 'var(--upbit-bid)' }}
        >
          {loading ? '처리 중…' : '결제 완료 (테스트)'}
        </button>
      </div>
    </div>
  );
}

export default function PayPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">로딩…</div>}>
      <PayContent />
    </Suspense>
  );
}

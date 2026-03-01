'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import Confetti from '@/components/ui/Confetti';

type Order = {
  id: string;
  amount: number;
  quantity?: number;
  status?: string;
  created_at: string;
};

function OrderSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const isDemo = orderId === 'demo' || orderId === 'preview';

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    if (isDemo) {
      setOrder({
        id: 'demo',
        amount: 12_300,
        quantity: 1,
        status: 'completed',
        created_at: new Date().toISOString(),
      });
      setLoading(false);
      return;
    }
    fetch(`/api/orders/${orderId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setOrder(data);
        setLoading(false);
      });
  }, [orderId, isDemo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--toss-bg)]">
        <div className="body-sm text-[var(--toss-text-secondary)]">확인 중…</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[var(--toss-bg)]">
        <div className="body font-semibold mb-4" style={{ color: '#eb4d3d' }}>주문 정보를 찾을 수 없습니다.</div>
        <Link href="/" className="body-sm font-medium text-[var(--toss-blue)]">홈으로</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col px-6 pt-12 pb-8 bg-[var(--toss-bg)]">
      <Confetti duration={600} />
      <div className="flex-1 flex flex-col items-center justify-center">
        <CheckCircle size={58} strokeWidth={2} className="mb-4 text-[var(--toss-blue)]" />
        <h1 className="h2 font-bold mb-1 text-[var(--toss-text)]">매수 완료</h1>
        <div className="h1 font-bold tracking-tight mb-2 text-[var(--toss-text)]" style={{ fontVariantNumeric: 'tabular-nums' }}>
          ₩{order.amount.toLocaleString()}
        </div>
        <div className="body-sm mb-1 text-[var(--toss-text-secondary)]">
          {new Date(order.created_at).toLocaleString('ko-KR')}
        </div>
        {order.status && (
          <span className="caption px-2.5 py-1 rounded-full font-medium text-[var(--toss-blue)]" style={{ backgroundColor: 'rgba(49,130,246,0.12)' }}>
            {order.status}
          </span>
        )}
      </div>

      <div className="space-y-3 mt-auto">
        <button
          onClick={() => {
            window.dispatchEvent(new Event('wallet-refresh'));
            router.push('/wallet');
          }}
          className="w-full py-4 rounded-2xl body font-bold text-white bg-[var(--toss-blue)]"
          style={{ boxShadow: '0 4px 12px rgba(49,130,246,0.35)' }}
        >
          내 지갑 보기
        </button>
        <Link
          href="/"
          className="block w-full py-4 rounded-2xl body font-semibold text-center bg-[var(--toss-card)] border border-[var(--toss-border)] text-[var(--toss-text)]"
        >
          홈으로
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--toss-bg)]">
        <div className="body-sm text-[var(--toss-text-secondary)]">확인 중…</div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}

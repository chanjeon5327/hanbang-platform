'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

type Order = {
  id: string;
  amount: number;
  created_at: string;
};

export default function OrderSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    fetch(`/api/orders/${orderId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setOrder(data);
        setLoading(false);
      });
  }, [orderId]);

  if (loading) {
    return <div className="p-6 text-center">확인 중…</div>;
  }

  if (!order) {
    return (
      <div className="p-6 text-center text-red-500">
        주문 정보를 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center px-6 text-center space-y-4">
      <h1 className="text-3xl font-bold">🎉 매수 완료</h1>

      <div className="text-lg font-semibold">
        {order.amount.toLocaleString()}원
      </div>

      <div className="text-sm text-gray-500">
        {new Date(order.created_at).toLocaleString()}
      </div>

      <button
        onClick={() => router.push('/wallet')}
        className="mt-6 w-full h-12 rounded-xl bg-black text-white font-semibold"
      >
        내 지갑 보기
      </button>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type OrderDetail = {
  id: string;
  status: string;
  created_at: string;
  product: {
    id: string;
    name: string | null;
    description: string | null;
  } | null;
  user: {
    email: string | null;
  } | null;
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          created_at,
          products (
            id,
            name,
            description
          ),
          users (
            email
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) {
        console.error('주문 상세 조회 실패', error);
      } else {
        setOrder({
          ...data,
          product: (data as any).products,
          user: (data as any).users,
        });
      }

      setLoading(false);
    };

    fetchOrder();
  }, [orderId]);

  if (loading) return <div style={{ padding: 24 }}>로딩 중...</div>;
  if (!order) return <div style={{ padding: 24 }}>주문을 찾을 수 없습니다.</div>;

  return (
    <div style={{ padding: 24 }}>
      <button onClick={() => router.back()}>← 목록으로</button>

      <h1 style={{ marginTop: 16 }}>🧾 구매 요청 상세</h1>

      <section style={{ marginTop: 16 }}>
        <h3>콘텐츠 정보</h3>
        <p><strong>제목:</strong> {order.product?.name ?? '(제목 없음)'}</p>
        <p><strong>설명:</strong> {order.product?.description ?? '-'}</p>
      </section>

      <section style={{ marginTop: 16 }}>
        <h3>구매자</h3>
        <p>{order.user?.email ?? '(비공개)'}</p>
      </section>

      <section style={{ marginTop: 16 }}>
        <h3>주문 상태</h3>
        <p>{order.status}</p>
        <p>{new Date(order.created_at).toLocaleString()}</p>
      </section>

      <section style={{ marginTop: 24 }}>
        <button disabled>승인 (준비중)</button>{' '}
        <button disabled>거절 (준비중)</button>
      </section>
    </div>
  );
}

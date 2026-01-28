'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SellDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 상품 조회
  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error(error);
      }

      setProduct(data);
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (!product) {
    return <div>출품작을 찾을 수 없습니다.</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>{product.title}</h1>
      <p>{product.description}</p>

      <hr style={{ margin: '24px 0' }} />

      <button
        onClick={async () => {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (!session) {
            alert('로그인이 필요합니다');
            router.push('/login');
            return;
          }

          const { error } = await supabase.from('orders').insert({
            product_id: id,
            user_id: session.user.id,
            status: 'requested',
          });

          if (error) {
            alert('구매 요청 중 오류가 발생했습니다');
            console.error(error);
            return;
          }

          router.push('/order/complete');
        }}
      >
        구매하기
      </button>
    </div>
  );
}

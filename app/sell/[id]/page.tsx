'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

type Product = {
  id: string;
  name: string;
  price: number;
  user_id: string;
  description?: string | null;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SellDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, user_id, description')
        .eq('id', id)
        .single();

      if (!error && data) {
        setProduct(data as Product);
      }

      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  const handleUseContent = async () => {
    if (!product) return;

    setProcessing(true);

    // 🔹 모의 포인트 차감 (실제 DB 변경 없음)
    setTimeout(() => {
      alert(
        `콘텐츠 이용 완료\n\n차감 포인트: ${product.price.toLocaleString()}P\n(※ 현재는 테스트 모드입니다)`
      );
      setProcessing(false);
    }, 700);
  };

  if (loading) {
    return <div style={{ padding: 24 }}>불러오는 중...</div>;
  }

  if (!product) {
    return <div style={{ padding: 24 }}>출품작을 찾을 수 없습니다.</div>;
  }

  return (
    <div style={{ padding: 24, maxWidth: 720 }}>
      <h1 style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 12 }}>
        {product.name}
      </h1>

      <div style={{ marginBottom: 8 }}>
        <strong>이용 포인트</strong>: {product.price.toLocaleString()}P
      </div>

      <div style={{ marginBottom: 16, fontSize: 12, color: '#666' }}>
        출품자: {product.user_id}
      </div>

      {product.description && (
        <div style={{ marginBottom: 24 }}>
          <strong>설명</strong>
          <div style={{ marginTop: 4, whiteSpace: 'pre-wrap' }}>
            {product.description}
          </div>
        </div>
      )}

      <button
        onClick={handleUseContent}
        disabled={processing}
        style={{
          padding: '10px 16px',
          borderRadius: 8,
          border: '1px solid #333',
          background: processing ? '#ddd' : '#fff',
          cursor: processing ? 'not-allowed' : 'pointer',
          fontWeight: 'bold',
        }}
      >
        {processing ? '처리 중...' : '콘텐츠 이용하기'}
      </button>
    </div>
  );
}

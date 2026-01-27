'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

type Product = {
  id: string;
  name: string;
  price: number;
  user_id: string;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SellPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products') // ⬅️ 어제 쓰던 테이블명
        .select('id, name, price, user_id')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setProducts(data as Product[]);
      }

      setLoading(false);
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <div style={{ padding: 24 }}>불러오는 중...</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
        출품 목록
      </h1>

      {products.length === 0 ? (
        <div style={{ color: '#666' }}>아직 출품된 콘텐츠가 없습니다.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {products.map((p) => (
            <Link key={p.id} href={`/sell/${p.id}`}>
              <div
                style={{
                  border: '1px solid #ddd',
                  borderRadius: 8,
                  padding: 12,
                  cursor: 'pointer',
                }}
              >
                <div>
                  <strong>상품명</strong>: {p.name}
                </div>
                <div>
                  <strong>가격</strong>: {p.price.toLocaleString()}원
                </div>
                <div style={{ fontSize: 12, color: '#666' }}>
                  출품자: {p.user_id}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function MarketPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, title, name, description, status')
        .eq('status', 'open');

      if (error) {
        console.error('market fetch error:', error);
      }

      setProducts(data || []);
      setLoading(false);
    };

    fetchProducts();
  }, []);

  if (loading) return <div>로딩 중...</div>;

  if (products.length === 0) {
    return <div>현재 판매 중인 콘텐츠가 없습니다.</div>;
  }

  return (
    <div>
      <h1>판매 중인 콘텐츠</h1>

      <ul>
        {products.map((p) => (
          <li key={p.id} style={{ marginBottom: 16 }}>
            <h3>{p.title || p.name || '(제목 없음)'}</h3>
            <p>{p.description}</p>
            <p>상태: {p.status}</p>

            <Link href={`/sell/${p.id}`}>
              👉 콘텐츠 보러가기
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

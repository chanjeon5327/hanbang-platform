'use client';

import { useEffect, useState } from 'react';
import { listPublicProducts } from '@/lib/products/publicProducts';
import type { ProductRow } from '@/lib/products/types';

export default function ProductsPage() {
  const [items, setItems] = useState<ProductRow[]>([]);
  const [err, setErr] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        setErr('');
        const data = await listPublicProducts();
        setItems(data);
      } catch (e: any) {
        setErr(e?.message ?? '로드 실패');
      }
    })();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>상품 목록</h1>

      {err && <p style={{ color: 'crimson' }}>{err}</p>}

      <div style={{ display: 'grid', gap: 12 }}>
        {items.map((p) => (
          <div
            key={p.id}
            style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <strong>{p.title}</strong>
              <span>{p.status}</span>
            </div>
            <div style={{ marginTop: 8, fontSize: 13, opacity: 0.85 }}>
              <div>가격(원): {p.price_krw ?? '-'}</div>
              <div>
                잔여/총수량: {p.remaining_quantity ?? '-'} / {p.total_quantity ?? '-'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

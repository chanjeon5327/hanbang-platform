'use client';

import { useEffect, useState } from 'react';
import { listMyProducts, closeProduct, reopenProduct } from '@/lib/products/sellerProducts';
import type { ProductRow } from '@/lib/products/types';

export default function SellerProductsPage() {
  const [items, setItems] = useState<ProductRow[]>([]);
  const [err, setErr] = useState<string>('');
  const [msg, setMsg] = useState<string>('');

  const load = async () => {
    try {
      setErr('');
      const data = await listMyProducts();
      setItems(data);
    } catch (e: any) {
      setErr(e?.message ?? '로드 실패');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onClose = async (id: string) => {
    try {
      setMsg('');
      await closeProduct(id);
      setMsg('closed 처리 완료');
      await load();
    } catch (e: any) {
      setErr(e?.message ?? '실패');
    }
  };

  const onReopen = async (id: string) => {
    try {
      setMsg('');
      await reopenProduct(id);
      setMsg('open 처리 완료');
      await load();
    } catch (e: any) {
      setErr(e?.message ?? '실패');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>판매자 상품 관리</h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <a href="/seller/products/new">+ 새 상품</a>
        <a href="/products">구매자 상품 목록 보기</a>
      </div>

      {msg && <p>{msg}</p>}
      {err && <p style={{ color: 'crimson' }}>{err}</p>}

      <div style={{ display: 'grid', gap: 12 }}>
        {items.map((p) => (
          <div key={p.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
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

            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <a href={`/seller/products/${p.id}/edit`}>수정</a>
              {p.status !== 'ended' && p.status !== 'closed' && (
                <button onClick={() => onClose(p.id)}>닫기(closed)</button>
              )}
              {p.status === 'closed' && (
                <button onClick={() => onReopen(p.id)}>다시열기(open)</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

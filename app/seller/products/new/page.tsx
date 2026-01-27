'use client';

import { useState } from 'react';
import { createProduct } from '@/lib/products/sellerProducts';

export default function SellerProductNewPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priceKrw, setPriceKrw] = useState('50000');
  const [totalQty, setTotalQty] = useState('10');

  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  const onCreate = async () => {
    try {
      setErr('');
      setMsg('');

      const created = await createProduct({
        title,
        description,
        price_krw: Number(priceKrw),
        total_quantity: Number(totalQty),
        remaining_quantity: Number(totalQty),
        status: 'open',
      });

      setMsg(`생성 완료: ${created.id}`);
      window.location.href = `/seller/products/${created.id}/edit`;
    } catch (e: any) {
      setErr(e?.message ?? '생성 실패');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>새 상품 생성</h1>

      {msg && <p>{msg}</p>}
      {err && <p style={{ color: 'crimson' }}>{err}</p>}

      <div style={{ display: 'grid', gap: 10, maxWidth: 520 }}>
        <label>
          제목
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>

        <label>
          설명
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>

        <label>
          가격(원)
          <input type="number" value={priceKrw} onChange={(e) => setPriceKrw(e.target.value)} />
        </label>

        <label>
          총 수량
          <input type="number" value={totalQty} onChange={(e) => setTotalQty(e.target.value)} />
        </label>

        <button onClick={onCreate}>생성</button>
      </div>
    </div>
  );
}

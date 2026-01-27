'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getProductById, updateProduct } from '@/lib/products/sellerProducts';

export default function SellerProductEditPage() {
  const params = useParams();
  const productId = params.id as string;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priceKrw, setPriceKrw] = useState('0');
  const [totalQty, setTotalQty] = useState('0');
  const [remainingQty, setRemainingQty] = useState('0');
  const [status, setStatus] = useState<'open' | 'closed' | 'ended'>('open');

  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setErr('');
        const p = await getProductById(productId);
        setTitle(p.title ?? '');
        setDescription(p.description ?? '');
        setPriceKrw(String(p.price_krw ?? 0));
        setTotalQty(String(p.total_quantity ?? 0));
        setRemainingQty(String(p.remaining_quantity ?? 0));
        setStatus(p.status ?? 'open');
      } catch (e: any) {
        setErr(e?.message ?? '로드 실패');
      }
    })();
  }, [productId]);

  const onSave = async () => {
    try {
      setErr('');
      setMsg('');

      await updateProduct(productId, {
        title,
        description,
        price_krw: Number(priceKrw),
        total_quantity: Number(totalQty),
        remaining_quantity: Number(remainingQty),
        status,
      });

      setMsg('저장 완료');
    } catch (e: any) {
      setErr(e?.message ?? '저장 실패');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>상품 수정</h1>
      <p>product_id: {productId}</p>

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

        <label>
          잔여 수량
          <input type="number" value={remainingQty} onChange={(e) => setRemainingQty(e.target.value)} />
        </label>

        <label>
          상태
          <select value={status} onChange={(e) => setStatus(e.target.value as any)}>
            <option value="open">open</option>
            <option value="closed">closed</option>
            <option value="ended">ended</option>
          </select>
        </label>

        <button onClick={onSave}>저장</button>
      </div>
    </div>
  );
}

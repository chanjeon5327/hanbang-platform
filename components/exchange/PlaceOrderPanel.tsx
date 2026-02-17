/**
 * PlaceOrderPanel — 매수/매도 주문 패널 (LIMIT/MARKET 탭)
 */
'use client';

import { useState, useCallback } from 'react';
import { formatKrw } from '@/lib/utils/format';

export default function PlaceOrderPanel({ assetId }: { assetId: string }) {
  const [tab, setTab] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'LIMIT' | 'MARKET'>('LIMIT');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [amountMax, setAmountMax] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; error?: string; order_id?: string } | null>(null);

  const submit = useCallback(async () => {
    setLoading(true);
    setResult(null);
    try {
      const body: Record<string, unknown> = {
        asset_id: assetId,
        side: tab,
        order_type: orderType,
        idempotency_key: crypto.randomUUID(),
      };
      if (orderType === 'LIMIT') {
        body.price = Number(price);
        body.quantity = Number(quantity);
      } else if (tab === 'BUY') {
        body.amount_max = Number(amountMax);
      } else {
        body.quantity = Number(quantity);
      }

      const res = await fetch('/api/exchange/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setResult(data);
      if (data.ok) { setPrice(''); setQuantity(''); setAmountMax(''); }
    } catch (e) {
      setResult({ ok: false, error: e instanceof Error ? e.message : '오류 발생' });
    } finally {
      setLoading(false);
    }
  }, [assetId, tab, orderType, price, quantity, amountMax]);

  const isBuy = tab === 'BUY';
  const accent = isBuy ? 'var(--upbit-positive, #16a34a)' : 'var(--upbit-ask, #dc2626)';

  return (
    <div className="rounded-2xl border p-4" style={{ backgroundColor: 'var(--card-bg, #fff)', borderColor: 'var(--border-color, #e5e7eb)' }}>
      {/* 매수/매도 탭 */}
      <div className="flex mb-3 rounded-lg overflow-hidden border" style={{ borderColor: 'var(--border-color, #e5e7eb)' }}>
        {(['BUY', 'SELL'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setTab(s)}
            className="flex-1 py-2 text-sm font-semibold transition"
            style={{
              backgroundColor: tab === s ? (s === 'BUY' ? '#16a34a' : '#dc2626') : 'transparent',
              color: tab === s ? '#fff' : 'var(--text-secondary, #6b7280)',
            }}
          >
            {s === 'BUY' ? '매수' : '매도'}
          </button>
        ))}
      </div>

      {/* 지정가/시장가 탭 */}
      <div className="flex gap-2 mb-3">
        {(['LIMIT', 'MARKET'] as const).map((ot) => (
          <button
            key={ot}
            onClick={() => setOrderType(ot)}
            className="px-3 py-1 text-xs rounded-lg font-medium transition"
            style={{
              backgroundColor: orderType === ot ? accent : 'var(--bg-secondary, #f3f4f6)',
              color: orderType === ot ? '#fff' : 'var(--text-secondary, #6b7280)',
            }}
          >
            {ot === 'LIMIT' ? '지정가' : '시장가'}
          </button>
        ))}
      </div>

      {/* 입력 필드 */}
      <div className="space-y-2 mb-3">
        {orderType === 'LIMIT' && (
          <Input label="가격 (KRW)" value={price} onChange={setPrice} placeholder="0" />
        )}
        {(orderType === 'LIMIT' || tab === 'SELL') && (
          <Input label="수량" value={quantity} onChange={setQuantity} placeholder="0" />
        )}
        {orderType === 'MARKET' && tab === 'BUY' && (
          <Input label="최대 금액 (KRW)" value={amountMax} onChange={setAmountMax} placeholder="0" />
        )}
        {orderType === 'LIMIT' && price && quantity && (
          <div className="text-xs text-right" style={{ color: 'var(--text-muted, #9ca3af)' }}>
            총액 {formatKrw(Number(price) * Number(quantity))}
          </div>
        )}
      </div>

      {/* 주문 버튼 */}
      <button
        onClick={submit}
        disabled={loading}
        className="w-full py-3 rounded-xl font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: accent }}
      >
        {loading ? '처리 중...' : (isBuy ? '매수' : '매도')}
      </button>

      {/* 결과 */}
      {result && (
        <div className={`mt-2 text-xs p-2 rounded-lg ${result.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {result.ok ? `주문 완료 (${result.order_id?.slice(0, 8)}...)` : `오류: ${result.error}`}
        </div>
      )}
    </div>
  );
}

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div>
      <label className="text-xs mb-1 block" style={{ color: 'var(--text-secondary, #6b7280)' }}>{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg border text-sm tabular-nums"
        style={{ borderColor: 'var(--border-color, #e5e7eb)', backgroundColor: 'var(--bg-secondary, #f9fafb)', color: 'var(--text-primary, #111)' }}
      />
    </div>
  );
}

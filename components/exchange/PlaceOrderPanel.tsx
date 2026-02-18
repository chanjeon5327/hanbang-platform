/**
 * PlaceOrderPanel — 매수/매도 주문 패널 (LIMIT/MARKET 탭)
 * HANBANG Design V1: 통일된 카드/토큰
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
  const accent = isBuy ? 'var(--emerald)' : 'var(--accent-loss)';

  return (
    <div className="rounded-[var(--radius-base)] border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-sm)', padding: 'var(--space-md)' }}>
      {/* 매수/매도 탭 */}
      <div className="flex mb-3 rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
        {(['BUY', 'SELL'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setTab(s)}
            className="flex-1 py-2 body-sm font-semibold transition"
            style={{
              backgroundColor: tab === s ? (s === 'BUY' ? 'var(--emerald)' : 'var(--accent-loss)') : 'transparent',
              color: tab === s ? '#fff' : 'var(--text-secondary)',
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
            className="px-3 py-1 caption rounded-lg font-medium transition"
            style={{
              backgroundColor: orderType === ot ? accent : 'var(--bg-secondary)',
              color: orderType === ot ? '#fff' : 'var(--text-secondary)',
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
          <div className="caption text-right metric-number" style={{ color: 'var(--text-muted)' }}>
            총액 {formatKrw(Number(price) * Number(quantity))}
          </div>
        )}
      </div>

      {/* 주문 버튼 */}
      <button
        onClick={submit}
        disabled={loading}
        className="w-full py-3 rounded-2xl font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: accent }}
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            처리 중...
          </span>
        ) : (isBuy ? '매수' : '매도')}
      </button>

      {/* 결과 */}
      {result && (
        <div
          className="mt-2 caption p-2 rounded-lg"
          style={{
            backgroundColor: result.ok ? 'rgba(5,150,105,0.08)' : 'rgba(220,38,38,0.08)',
            color: result.ok ? 'var(--emerald)' : 'var(--accent-loss)',
          }}
        >
          {result.ok ? `주문 완료 (${result.order_id?.slice(0, 8)}...)` : `오류: ${result.error}`}
        </div>
      )}
    </div>
  );
}

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div>
      <label className="caption mb-1 block" style={{ color: 'var(--text-secondary)' }}>{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-xl border body-sm metric-number focus:outline-none focus:ring-2 focus:ring-[var(--royal-blue)]"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text)' }}
      />
    </div>
  );
}

'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Plus, Minus } from 'lucide-react';
import { formatKrw } from '@/lib/utils/format';
import { spacing, radius } from '@/lib/design/tokens';
import Skeleton from '@/components/ui/Skeleton';

type OrderType = 'limit' | 'market';
type OrderCondition = 'normal' | 'ioc' | 'fok';

const MIN_ORDER_KRW = 10_000;

type Props = {
  contentId: string;
  sharePriceUsd: number;
  fxRate: number;
  isLoggedIn: boolean;
  disabled?: boolean;
  onToast?: (msg: string) => void;
};

export default function OrderPanel({
  contentId,
  sharePriceUsd,
  fxRate,
  isLoggedIn,
  disabled = false,
  onToast,
}: Props) {
  const router = useRouter();
  const pathname = usePathname() ?? '/';
  const [orderType, setOrderType] = useState<OrderType>('limit');
  const [condition, setCondition] = useState<OrderCondition>('normal');
  const [orderSide, setOrderSide] = useState<'bid' | 'ask'>('bid');
  const [price, setPrice] = useState(sharePriceUsd.toFixed(2));
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPrice(sharePriceUsd.toFixed(2));
  }, [sharePriceUsd]);

  const currentPriceKrw = useMemo(() => sharePriceUsd * fxRate, [sharePriceUsd, fxRate]);
  const priceKrw = useMemo(() => parseFloat(price || '0') * fxRate, [price, fxRate]);
  const totalKrw = useMemo(
    () => (orderType === 'market' ? currentPriceKrw * qty : priceKrw * qty),
    [orderType, currentPriceKrw, priceKrw, qty]
  );
  const belowMin = totalKrw < MIN_ORDER_KRW && totalKrw > 0;

  const showToast = useCallback(
    (msg: string) => {
      onToast?.(msg);
    },
    [onToast]
  );

  const handlePlaceOrder = useCallback(async () => {
    if (disabled) return;
    if (!isLoggedIn) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (belowMin) {
      showToast(`최소 주문 금액은 ${formatKrw(MIN_ORDER_KRW)}입니다.`);
      return;
    }
    setLoading(true);
    const idempotencyKey = crypto.randomUUID();
    try {
      if (orderType === 'limit') {
        const res = await fetch('/api/orders/orderbook/place', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            item_id: contentId,
            content_id: contentId,
            side: orderSide,
            price_usd: parseFloat(price || '0'),
            quantity: qty,
            price_krw: Math.round(parseFloat(price || '0') * fxRate),
            idempotency_key: idempotencyKey,
          }),
        });
        const json = await res.json();
        if (res.status === 403 && (json?.code === 'KYC_REQUIRED' || json?.error === 'KYC_REQUIRED')) {
          showToast('인증이 필요해요.');
          router.push('/kyc');
          return;
        }
        if (json?.success) {
          showToast(json?.matched_count > 0 ? `${json.matched_count}건 체결` : '주문 접수');
          window.dispatchEvent(new Event('invest-success'));
          window.dispatchEvent(new Event('wallet-refresh'));
          setQty(1);
        } else {
          showToast(json?.error ?? '주문 실패');
        }
      } else if (orderSide === 'ask') {
        const res = await fetch('/api/orders/sell', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_id: contentId,
            content_id: contentId,
            quantity: qty,
            idempotency_key: idempotencyKey,
          }),
        });
        const json = await res.json();
        if (res.status === 403 && (json?.code === 'KYC_REQUIRED' || json?.error === 'KYC_REQUIRED')) {
          showToast('인증이 필요해요.');
          router.push('/kyc');
          return;
        }
        if (json?.success) {
          showToast('주문 체결');
          window.dispatchEvent(new Event('invest-success'));
          window.dispatchEvent(new Event('wallet-refresh'));
          setQty(1);
        } else {
          showToast(json?.error ?? '주문 실패');
        }
      } else {
        const amount = Math.round(currentPriceKrw * qty);
        const res = await fetch('/api/orders/place', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_id: contentId,
            content_id: contentId,
            amount,
            idempotency_key: idempotencyKey,
          }),
        });
        const json = await res.json();
        if (res.status === 403 && (json?.code === 'KYC_REQUIRED' || json?.error === 'KYC_REQUIRED')) {
          showToast('인증이 필요해요.');
          router.push('/kyc');
          return;
        }
        if (json?.success) {
          showToast('주문 체결');
          window.dispatchEvent(new Event('invest-success'));
          window.dispatchEvent(new Event('wallet-refresh'));
          setQty(1);
        } else {
          showToast(json?.error ?? '주문 실패');
        }
      }
    } catch {
      showToast('주문에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [
    disabled,
    isLoggedIn,
    belowMin,
    orderType,
    orderSide,
    price,
    qty,
    contentId,
    fxRate,
    currentPriceKrw,
    router,
    showToast,
  ]);

  const inputStyle = {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: radius.sm,
    padding: `${spacing.sm}px ${spacing.md}px`,
    fontSize: 14,
    color: 'var(--text)',
  };

  if (disabled) {
    return (
      <div
        className="rounded-2xl p-4"
        style={{
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
        }}
      >
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <p className="text-center" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            거래 준비 중입니다. 모집 완료 후 이용 가능합니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-4"
      style={{
        backgroundColor: 'var(--card)',
        border: '1px solid var(--border)',
        boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
      }}
    >
      <div className="flex flex-col gap-4" style={{ gap: spacing.lg }}>
        {/* 지정가/시장가 */}
        <div className="flex gap-2">
          {(['limit', 'market'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setOrderType(t)}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition"
              style={{
                backgroundColor: orderType === t ? 'var(--royal-blue)' : 'var(--bg-secondary)',
                color: orderType === t ? '#fff' : 'var(--text-secondary)',
              }}
            >
              {t === 'limit' ? '지정가' : '시장가'}
            </button>
          ))}
        </div>

        {/* 주문조건: 보통/IOC/FOK */}
        <div className="flex gap-2">
          {[
            { key: 'normal' as const, label: '보통' },
            { key: 'ioc' as const, label: 'IOC' },
            { key: 'fok' as const, label: 'FOK' },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setCondition(key)}
              disabled={loading}
              className="flex-1 py-2 rounded-lg font-medium text-xs transition"
              style={{
                backgroundColor: condition === key ? 'var(--bg-secondary)' : 'transparent',
                color: condition === key ? 'var(--text)' : 'var(--text-muted)',
                border: `1px solid ${condition === key ? 'var(--border-strong)' : 'var(--border)'}`,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 매수/매도 */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setOrderSide('bid')}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition"
            style={{
              backgroundColor: orderSide === 'bid' ? 'rgba(220,38,38,0.12)' : 'var(--bg-secondary)',
              color: orderSide === 'bid' ? 'var(--accent-loss)' : 'var(--text-secondary)',
              border: `2px solid ${orderSide === 'bid' ? 'var(--accent-loss)' : 'transparent'}`,
            }}
          >
            매수
          </button>
          <button
            type="button"
            onClick={() => setOrderSide('ask')}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition"
            style={{
              backgroundColor: orderSide === 'ask' ? 'rgba(37,99,235,0.12)' : 'var(--bg-secondary)',
              color: orderSide === 'ask' ? 'var(--royal-blue)' : 'var(--text-secondary)',
              border: `2px solid ${orderSide === 'ask' ? 'var(--royal-blue)' : 'transparent'}`,
            }}
          >
            매도
          </button>
        </div>

        {/* 가격 (지정가일 때) */}
        {orderType === 'limit' && (
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={loading}
              placeholder="가격 (USD)"
              className="flex-1 tabular-nums"
              style={inputStyle}
            />
            <div className="flex">
              <button
                type="button"
                onClick={() => setPrice((parseFloat(price || '0') - 0.01).toFixed(2))}
                className="p-2 rounded-l-lg"
                style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text)' }}
              >
                <Minus size={16} />
              </button>
              <button
                type="button"
                onClick={() => setPrice((parseFloat(price || '0') + 0.01).toFixed(2))}
                className="p-2 rounded-r-lg"
                style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text)' }}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        )}

        {/* 수량 */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 0))}
            disabled={loading}
            placeholder="수량"
            className="flex-1 tabular-nums"
            style={inputStyle}
          />
          <div className="flex">
            <button
              type="button"
              onClick={() => setQty((v) => Math.max(1, v - 1))}
              className="p-2 rounded-l-lg"
              style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text)' }}
            >
              <Minus size={16} />
            </button>
            <button
              type="button"
              onClick={() => setQty((v) => v + 1)}
              className="p-2 rounded-r-lg"
              style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text)' }}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* 총액 */}
        <div
          className="py-2 font-bold tabular-nums"
          style={{ fontSize: 16, color: 'var(--text)' }}
        >
          총액 {formatKrw(totalKrw)}
        </div>

        {/* 최소주문금액/수수료 안내 */}
        <p
          className="text-center"
          style={{ fontSize: 12, color: 'var(--text-muted)' }}
        >
          최소 주문 {formatKrw(MIN_ORDER_KRW)} · 수수료 별도
        </p>

        {/* 주문 버튼 (OrderPanel은 주문 폼만, CTA는 TradeCTA에서) */}
        <button
          type="button"
          onClick={handlePlaceOrder}
          disabled={loading || !isLoggedIn || belowMin}
          className="w-full py-3 rounded-xl font-bold text-sm transition"
          style={{
            backgroundColor: orderSide === 'bid' ? 'var(--accent-loss)' : 'var(--royal-blue)',
            color: '#fff',
            opacity: loading || !isLoggedIn || belowMin ? 0.5 : 1,
          }}
        >
          {!isLoggedIn ? '로그인 후 주문' : belowMin ? '최소 금액 미달' : loading ? '처리 중…' : orderSide === 'bid' ? '매수하기' : '매도하기'}
        </button>
      </div>
    </div>
  );
}

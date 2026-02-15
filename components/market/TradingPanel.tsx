'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToken } from '@/context/TokenContext';
import { useToast } from '@/context/ToastContext';

/**
 * 거래 패널: 청약/매수 탭, 수량 입력, 예상 수익, 수수료, CTA
 * 모바일: 하단 Sticky / 데스크탑: 우측 고정
 */
type Props = {
  mode: '청약' | '매수';
  price: number;
  productId: string;
  isLoggedIn: boolean;
  isMobilization?: boolean;
  sticky?: boolean;
};

export default function TradingPanel({ mode: initialMode, price, productId, isLoggedIn, isMobilization = false, sticky = false }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const { formatPrice } = useToken();
  const [activeTab, setActiveTab] = useState<'청약' | '매수'>(initialMode);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);

  const amount = useMemo(() => qty * price, [qty, price]);
  const feeRate = 0.001;
  const fee = Math.round(amount * feeRate);
  const expectedProfitRate = 0.12; // 12% 가정
  const expectedProfit = Math.round(amount * expectedProfitRate);

  const handleCta = async () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    setLoading(true);
    try {
      const placeRes = await fetch('/api/orders/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          amount: Math.round(amount),
        }),
      });
      const placeJson = await placeRes.json();

      if (placeJson.success && placeJson.order_id) {
        toast('구매 완료');
        router.push('/wallet');
        return;
      }

      const err = placeJson.error ?? '';
      if (err === 'INSUFFICIENT_FUNDS') {
        toast('잔액 부족');
      } else {
        toast('구매 실패');
      }
    } catch {
      toast('구매 실패');
    } finally {
      setLoading(false);
    }
  };

  const ctaLabel = !isLoggedIn ? '로그인 후 참여' : activeTab === '청약' ? '청약하기' : '매수하기';

  const panel = (
    <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--upbit-panel)', borderColor: 'var(--upbit-border)' }}>
      <div className="flex border-b" style={{ borderColor: 'var(--upbit-border)' }}>
        {(['청약', '매수'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-3 text-[14px] font-semibold transition"
            style={{
              backgroundColor: activeTab === tab ? 'var(--upbit-bid)' : 'transparent',
              color: activeTab === tab ? '#fff' : 'var(--upbit-text-dim)',
            }}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="p-4 space-y-4">
        <div>
          <label className="text-[12px] block mb-1" style={{ color: 'var(--upbit-text-dim)' }}>수량</label>
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 0))}
            className="w-full rounded-lg px-4 py-3 text-[16px] focus:outline-none border"
            style={{ backgroundColor: 'var(--upbit-bg)', borderColor: 'var(--upbit-border)', color: 'var(--upbit-text)' }}
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-[13px]">
            <span style={{ color: 'var(--upbit-text-dim)' }}>예상 금액</span>
            <span className="font-semibold tabular-nums" style={{ color: 'var(--upbit-text)' }}>{formatPrice(amount)}</span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span style={{ color: 'var(--upbit-text-dim)' }}>예상 수익 (연 12% 가정)</span>
            <span className="font-semibold tabular-nums" style={{ color: 'var(--upbit-positive)' }}>{formatPrice(expectedProfit)}</span>
          </div>
          <div className="flex justify-between text-[12px]">
            <span style={{ color: 'var(--upbit-text-dim)' }}>수수료 (0.1%)</span>
            <span className="tabular-nums" style={{ color: 'var(--upbit-text-dim)' }}>{formatPrice(fee)}</span>
          </div>
        </div>
        <button
          onClick={handleCta}
          disabled={loading}
          data-testid="trade-cta"
          className="w-full py-3.5 rounded-lg text-white text-[16px] font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ backgroundColor: 'var(--upbit-bid)' }}
        >
          {loading ? '처리 중…' : !isLoggedIn ? ctaLabel : ctaLabel}
        </button>
        <p className="text-[11px] text-center" style={{ color: 'var(--upbit-text-dim)' }}>결제 후 즉시 참여됩니다</p>
      </div>
    </div>
  );

  if (sticky) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-[200] p-4 border-t" style={{ backgroundColor: 'var(--upbit-panel)', borderColor: 'var(--upbit-border)' }}>
        {panel}
      </div>
    );
  }

  return panel;
}

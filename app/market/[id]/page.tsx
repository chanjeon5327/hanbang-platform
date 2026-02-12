'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { useToken } from '@/context/TokenContext';
import MobilePriceChart from '@/components/market/MobilePriceChart';
import { OrderBookSummary, OrderBookPanel } from '@/components/market/OrderBook';
import MobileOrderStickyBar from '@/components/market/MobileOrderStickyBar';
import MobileOrderPanel from '@/components/market/MobileOrderPanel';
import TokenSelector from '@/components/market/TokenSelector';

/* 업비트 KRW 거래 UX: (a)상단 가격/등락 헤더 (b)차트+타임프레임 (c)호가창 (d)주문패널 (e)스티키바 — KRW/USDT/BTC 등 다중 토큰 지원 */

function MarketHeader() {
  const { theme, toggleTheme } = useTheme();
  const { formatPrice } = useToken();
  const lastPrice = 12300;
  const change = 3.2;
  const high52w = 13200;
  const low52w = 11500;

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--upbit-border)]" style={{ backgroundColor: 'var(--upbit-bg)' }}>
      <div className="px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-sm" style={{ color: 'var(--upbit-text-dim)' }}>‹ 뒤로</Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg transition hover:opacity-80"
            style={{ backgroundColor: 'var(--upbit-panel)', color: 'var(--upbit-text-dim)' }}
            aria-label={theme === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
            title={theme === 'light' ? '다크' : '라이트'}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <TokenSelector />
        </div>
      </div>
      <div className="px-4 pb-4">
        <h1 className="text-[18px] font-bold" style={{ color: 'var(--upbit-text)' }}>여행가 제이</h1>
        <p className="text-[13px] mt-0.5" style={{ color: 'var(--upbit-text-dim)' }}>크리에이터 · 여행</p>
        <div className="mt-3 flex items-baseline gap-3 flex-wrap">
          <span className="text-[24px] font-bold tabular-nums" style={{ color: 'var(--upbit-text)' }}>
            {formatPrice(lastPrice)}
          </span>
          <span className="text-[14px] font-semibold" style={{ color: change >= 0 ? 'var(--upbit-positive)' : 'var(--upbit-ask)', fontVariantNumeric: 'tabular-nums' }}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
          <span className="text-[12px]" style={{ color: 'var(--upbit-text-dim)' }}>전일대비</span>
        </div>
        <div className="flex gap-4 mt-2 text-[12px]" style={{ color: 'var(--upbit-text-dim)' }}>
          <span>52주高 {formatPrice(high52w)}</span>
          <span>52주低 {formatPrice(low52w)}</span>
        </div>
      </div>
    </header>
  );
}

function JoinFunnelButton({ contentId }: { contentId: string }) {
  const [loading, setLoading] = useState(false);
  const join = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await fetch('/api/funnel/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content_id: contentId, source: 'detail' }),
      });
      alert('합류 완료. 이후 업데이트를 받아보실 수 있습니다.');
    } catch {
      alert('잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="px-4 mt-4">
      <button
        onClick={join}
        disabled={loading}
        className="w-full rounded-lg border py-3 text-[14px] font-medium transition"
        style={{ borderColor: 'var(--upbit-border)', backgroundColor: 'var(--upbit-panel)', color: 'var(--upbit-text)' }}
      >
        {loading ? '처리 중…' : '👀 관심 콘텐츠로 합류하기'}
      </button>
    </section>
  );
}

function SideToggle({ side, onChange }: { side: 'BUY' | 'SELL'; onChange: (s: 'BUY' | 'SELL') => void }) {
  return (
    <section className="px-4 mt-4">
      <div className="grid grid-cols-2 rounded-lg overflow-hidden border border-[var(--upbit-border)]" style={{ backgroundColor: 'var(--upbit-panel)' }}>
        <button
          onClick={() => onChange('BUY')}
          className="py-2.5 text-[14px] font-semibold transition"
          style={{
            backgroundColor: side === 'BUY' ? 'var(--upbit-bid)' : 'transparent',
            color: side === 'BUY' ? '#fff' : 'var(--upbit-text-dim)',
          }}
        >
          매수
        </button>
        <button
          onClick={() => onChange('SELL')}
          className="py-2.5 text-[14px] font-semibold transition"
          style={{
            backgroundColor: side === 'SELL' ? 'var(--upbit-ask)' : 'transparent',
            color: side === 'SELL' ? '#fff' : 'var(--upbit-text-dim)',
          }}
        >
          매도
        </button>
      </div>
    </section>
  );
}

export default function MarketDetailPage({ params }: { params: { id: string } }) {
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [orderBookOpen, setOrderBookOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [buyVariant, setBuyVariant] = useState<'A' | 'B' | 'C'>('A');
  const [cohort, setCohort] = useState<'ANON' | 'NEW' | 'ACTIVE' | 'POWER'>('ANON');
  const lastPrice = 12300;

  useEffect(() => {
    fetch('/api/ab/assign-buy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content_id: params.id }),
    })
      .then((res) => res.json())
      .then((json) => { if (json?.variant) setBuyVariant(json.variant); })
      .catch(() => {});
  }, [params.id]);

  useEffect(() => {
    fetch('/api/ab/assign-cohort', { method: 'POST' })
      .then((res) => res.json())
      .then((json) => { if (json?.cohort) setCohort(json.cohort); })
      .catch(() => {});
  }, []);

  return (
    <main className="min-h-screen pb-32" style={{ backgroundColor: 'var(--upbit-bg)' }}>
      <MarketHeader />
      <MobilePriceChart />
      <JoinFunnelButton contentId={params.id} />

      {buyVariant === 'B' && (
        <section className="px-4 mt-2">
          <div className="rounded-lg text-[12px] px-3 py-2" style={{ backgroundColor: 'var(--upbit-ask-bg)', color: 'var(--upbit-ask)' }}>
            🔔 최근 합류와 매수 전환이 빠르게 증가하고 있습니다
          </div>
        </section>
      )}

      {cohort === 'POWER' && buyVariant === 'B' && (
        <section className="px-4 mt-2">
          <div className="rounded-lg text-[12px] px-3 py-2" style={{ backgroundColor: 'var(--upbit-bid-bg)', color: 'var(--upbit-bid)' }}>
            ⚡ 숙련 투자자에게는 지금이 진입 타이밍일 수 있습니다
          </div>
        </section>
      )}

      <SideToggle side={side} onChange={setSide} />
      <OrderBookSummary onOpen={() => setOrderBookOpen(true)} />
      <OrderBookPanel open={orderBookOpen} onClose={() => setOrderBookOpen(false)} />

      <MobileOrderStickyBar
        disabled={false}
        side={side}
        price={lastPrice}
        change={3.2}
        onOpen={() => setOrderOpen(true)}
      />

      <MobileOrderPanel
        open={orderOpen}
        side={side}
        price={lastPrice}
        productId={params.id}
        onClose={() => setOrderOpen(false)}
      />
    </main>
  );
}

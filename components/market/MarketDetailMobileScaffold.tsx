'use client';

import { useRef, useState, useEffect, type ReactNode } from 'react';
import MarketDetailMobileV2 from '@/components/market/detail-v2/MarketDetailMobileV2';
import type { MarketDetailLike } from '@/lib/market/detailTemplates';

type Props = {
  chart: ReactNode;
  trades: ReactNode;
  orderBook: ReactNode | null;
  orderPanel: ReactNode;
  item: MarketDetailLike | null;
};

export default function MarketDetailMobileScaffold({
  chart,
  trades,
  orderBook,
  orderPanel,
  item,
}: Props) {
  const orderPanelRef = useRef<HTMLDivElement>(null);
  const [orderPanelInView, setOrderPanelInView] = useState(true);

  const scrollToOrderPanel = () => {
    const el = document.getElementById('order-panel');
    if (!el) return;
    const headerOffset = 96;
    const top = el.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  useEffect(() => {
    const el = orderPanelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (e) setOrderPanelInView(e.isIntersecting);
      },
      { threshold: 0.1, rootMargin: '0px 0px -80px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="w-full pb-28">
      <MarketDetailMobileV2 item={item} />

      <section className="px-4 pt-4 space-y-4">
        {chart}
      </section>

      <section id="order-panel" ref={orderPanelRef} className="px-4 pt-4 scroll-mt-24">
        <CardBlock title="주문하기" className="pb-6">
          {orderPanel}
        </CardBlock>
      </section>

      {orderBook ? (
        <section className="px-4 pt-4 space-y-4">
          {orderBook}
        </section>
      ) : null}

      <section className="px-4 pt-4 pb-12 space-y-4">
        {trades}
      </section>

      {!orderPanelInView && (
        <div
          className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#0b0d12] shadow-[0_-8px_24px_rgba(0,0,0,0.28)] px-4 py-3 safe-area-pb"
          style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
        >
          <button
            type="button"
            onClick={scrollToOrderPanel}
            className="w-full h-12 rounded-2xl bg-blue-600 text-white text-sm font-extrabold hover:bg-blue-700 transition"
          >
            거래하기
          </button>
        </div>
      )}
    </div>
  );
}

function CardBlock({
  title,
  children,
  className = '',
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-[22px] border border-black/5 bg-white shadow-[0_8px_28px_rgba(15,23,42,0.08)] ${className}`}
    >
      <div className="border-b border-black/5 px-4 py-3">
        <h3 className="text-[14px] font-extrabold tracking-[-0.02em] text-[#111827]">
          {title}
        </h3>
      </div>
      <div className="px-4 py-4">{children}</div>
    </div>
  );
}

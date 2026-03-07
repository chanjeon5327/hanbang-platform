'use client';

import { useRef, useState, useEffect, type ReactNode } from 'react';

type Props = {
  summary: ReactNode;
  tabs: ReactNode;
  chart: ReactNode;
  trades: ReactNode;
  orderBook: ReactNode;
  orderPanel: ReactNode;
  thesis: ReactNode;
};

export default function MarketDetailMobileScaffold({
  summary,
  tabs,
  chart,
  trades,
  orderBook,
  orderPanel,
  thesis,
}: Props) {
  const orderPanelRef = useRef<HTMLDivElement>(null);
  const [orderPanelInView, setOrderPanelInView] = useState(true);

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

  const scrollToOrderPanel = () => {
    orderPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="w-full pb-28">
      <section className="px-4 pt-4">
        <div className="overflow-hidden rounded-[24px] border border-white/8 bg-[#0B1020] shadow-[0_10px_40px_rgba(0,0,0,0.28)]">
          {summary}
        </div>
      </section>

      <section className="sticky top-[56px] z-20 mt-4 border-y border-black/5 bg-[#F4F6FA]/90 backdrop-blur">
        <div className="px-4 py-2">{tabs}</div>
      </section>

      <section className="px-4 pt-4 space-y-4">
        {/* 1순위: 주문/거래하기 패널 */}
        <div ref={orderPanelRef} id="order-panel" className="scroll-mt-4">
          <CardBlock title="주문하기" className="pb-6">
            {orderPanel}
          </CardBlock>
        </div>

        {/* 2순위: 호가 */}
        <CardBlock title="호가">{orderBook}</CardBlock>

        {/* 3순위: 가격 차트 */}
        <CardBlock title="가격 차트">{chart}</CardBlock>

        {/* 4순위: 실시간 체결 */}
        <CardBlock title="실시간 체결">{trades}</CardBlock>
      </section>

      {/* 5순위: 정보/소개/기타 */}
      <section className="px-4 pb-6 pt-2">
        <CardBlock title="살까말까 / 지금얼마 / 거래하기">{thesis}</CardBlock>
      </section>

      {/* 하단 고정 CTA: 주문 패널이 화면 밖일 때만 표시 (sticky 하나만) */}
      {!orderPanelInView && (
        <div
          className="fixed left-0 right-0 bottom-0 z-30 border-t border-black/5 bg-white/95 backdrop-blur px-4 py-3 safe-area-pb"
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

'use client';

import { useRef, useState, useEffect, type ReactNode } from 'react';
import DetailTopTabPanel from '@/components/market/detail/DetailTopTabPanel';
import CategoryInfoSection from '@/components/market/detail/CategoryInfoSection';
import type { MarketDetailLike } from '@/lib/market/detailTemplates';

const detailTabs = [
  { key: 'thesis', label: '살까말까' },
  { key: 'price', label: '지금얼마' },
  { key: 'trade', label: '거래하기' },
  { key: 'info', label: '정보' },
] as const;

type DetailTabKey = (typeof detailTabs)[number]['key'];

type Props = {
  summary: ReactNode;
  chart: ReactNode;
  trades: ReactNode;
  orderBook: ReactNode;
  orderPanel: ReactNode;
  item: MarketDetailLike | null;
};

export default function MarketDetailMobileScaffold({
  summary,
  chart,
  trades,
  orderBook,
  orderPanel,
  item,
}: Props) {
  const orderPanelRef = useRef<HTMLDivElement>(null);
  const [orderPanelInView, setOrderPanelInView] = useState(true);
  const [activeTab, setActiveTab] = useState<DetailTabKey>('thesis');

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
      <section className="px-4 pt-4">
        <div className="overflow-hidden rounded-[24px] border border-white/8 bg-[#0B1020] shadow-[0_10px_40px_rgba(0,0,0,0.28)]">
          {summary}
        </div>
      </section>

      <div className="sticky top-[56px] z-20 border-b border-white/10 bg-[#0b0d12]/95 backdrop-blur mt-4">
        <div className="scrollbar-none flex items-center gap-2 overflow-x-auto px-4 py-3">
          {detailTabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  if (tab.key === 'trade') {
                    setActiveTab('trade');
                    scrollToOrderPanel();
                    return;
                  }
                  setActiveTab(tab.key);
                }}
                className={[
                  'shrink-0 rounded-full px-4 py-2 text-[13px] font-medium transition',
                  isActive
                    ? 'bg-white text-black'
                    : 'border border-white/10 bg-white/[0.05] text-zinc-300',
                ].join(' ')}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab !== 'trade' ? (
        <DetailTopTabPanel
          tab={activeTab as 'thesis' | 'price' | 'info'}
          item={item}
        />
      ) : null}

      <section id="order-panel" ref={orderPanelRef} className="px-4 pt-4 scroll-mt-24">
        <CardBlock title="주문하기" className="pb-6">
          {orderPanel}
        </CardBlock>
      </section>

      <section className="px-4 pt-4 space-y-4">
        <CardBlock title="호가">{orderBook}</CardBlock>
        <CardBlock title="가격 차트">{chart}</CardBlock>
        <CardBlock title="실시간 체결">{trades}</CardBlock>
      </section>

      <section id="detail-info" className="px-4 py-4">
        <div className="mb-3">
          <h3 className="text-[16px] font-semibold text-white">상세 정보 더보기</h3>
          <p className="mt-1 text-[12px] text-zinc-400">
            위 요약 패널에서 핵심을 보고, 아래에서 전체 정보를 이어서 확인합니다.
          </p>
        </div>
        {item ? <CategoryInfoSection item={item} /> : null}
      </section>

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

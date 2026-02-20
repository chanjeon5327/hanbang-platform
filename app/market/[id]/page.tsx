'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useMarketItem } from '@/hooks/useMarketItem';
import { formatKrw, formatRate } from '@/lib/utils/format';
import RealPriceChart from '@/components/market/RealPriceChart';
import MockOrderBook from '@/components/market/MockOrderBook';
import LiveChatMock from '@/components/market/LiveChatMock';
import DividendInfo from '@/components/market/DividendInfo';
import DividendSimulatorV2 from '@/components/market/DividendSimulatorV2';
import { ArrowUp, BarChart3, BookOpen, MessageCircle, Newspaper, PieChart, TrendingUp, Users } from 'lucide-react';
import styles from './market-detail.module.css';

const TABS = [
  { id: 'chart', label: '거래' },
  { id: 'invest', label: '투자정보' },
  { id: 'project', label: '프로젝트' },
  { id: 'news', label: '뉴스' },
  { id: 'chat', label: '채팅' },
] as const;

const NEWS_MOCK = [
  { id: '1', title: 'K-POP 투자 열기, 2차 시장 거래량 급증', date: '2025-02-18', summary: '아티스트 주식 2차 시장 거래량이 전월 대비 40% 증가하며 투자자 관심이 높아지고 있다.', imageUrl: '/sample-bright.jpg' },
  { id: '2', title: '아티스트 주식 청약 3일 만에 80% 달성', date: '2025-02-15', summary: '신규 청약 상품이 출시 3일 만에 모집 목표의 80%를 달성하며 투자 열기를 보여준다.', imageUrl: '/sample-bright.jpg' },
  { id: '3', title: '배당 수익률 12% 돌파, 투자자 관심 집중', date: '2025-02-12', summary: '연간 예상 배당 수익률이 12%를 넘어서며 장기 투자자들의 관심이 늘고 있다.', imageUrl: '/sample-bright.jpg' },
];

const TICKER_MOCK = [
  { price: 13520, qty: 5, side: 'buy' as const, time: '14:42:31' },
  { price: 13510, qty: 3, side: 'sell' as const, time: '14:42:28' },
  { price: 13520, qty: 10, side: 'buy' as const, time: '14:42:25' },
  { price: 13500, qty: 2, side: 'sell' as const, time: '14:42:20' },
  { price: 13520, qty: 7, side: 'buy' as const, time: '14:42:15' },
];

export default function MarketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { item, loading, error, refetch } = useMarketItem(id);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]['id']>('chart');
  const [orderPrice, setOrderPrice] = useState('');
  const [orderQty, setOrderQty] = useState('');
  const [orderType, setOrderType] = useState<'limit' | 'market'>('limit');
  const [t1t2, setT1t2] = useState<'T1' | 'T2'>('T1');
  const [videoPlaying, setVideoPlaying] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const onScroll = () => setShowScrollTop(typeof window !== 'undefined' && window.scrollY > 300);
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const sid = (e.target as HTMLElement).dataset.section;
            if (sid) {
              const tabId = sid === 'orderbook' || sid === 'trades' ? 'chart' : sid;
              setActiveTab(tabId as (typeof TABS)[number]['id']);
            }
          }
        });
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    );
    const sectionsToObserve = ['chart', 'orderbook', 'trades', 'invest', 'project', 'news', 'chat'];
    sectionsToObserve.forEach((sid) => {
      const el = sectionRefs.current[sid];
      if (el) { el.dataset.section = sid; observer.observe(el); }
    });
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (tabId: string) => {
    const el = sectionRefs.current[tabId];
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const title = item?.title ?? '—';
  const fxRate = item?.fx_rate ?? 1350;
  const sharePriceUsd = item?.share_price_usd ?? 10;
  const sharePriceKrw = sharePriceUsd * fxRate;
  const prevCloseUsd = sharePriceUsd * 0.98;
  const changeRate = ((sharePriceUsd - prevCloseUsd) / prevCloseUsd) * 100;
  const changeAmountKrw = (sharePriceUsd - prevCloseUsd) * fxRate;
  const isUp = changeRate > 0;
  const changeText = changeRate !== 0 || changeAmountKrw !== 0
    ? `${isUp ? '+' : ''}${formatRate(changeRate)} (${isUp ? '+' : ''}${Math.round(changeAmountKrw).toLocaleString('ko-KR')})`
    : null;
  const priceDisplay = loading ? '—' : formatKrw(sharePriceKrw);
  const usdDisplay = loading ? '—' : `$${sharePriceUsd.toFixed(2)} USD`;

  const priceNum = parseFloat(orderPrice) || 0;
  const qtyNum = parseFloat(orderQty) || 0;
  const orderTotal = priceNum * qtyNum;
  const feeRate = 0.0003;
  const orderFee = Math.round(orderTotal * feeRate);

  const setQtyPercent = (pct: number) => {
    const maxQty = 100;
    setOrderQty(String(Math.floor(maxQty * (pct / 100))));
  };

  if (error && !item) {
    return (
      <div className="flex flex-col items-center justify-center p-6 min-h-screen" style={{ backgroundColor: 'var(--card)' }}>
        <p className="mb-4 font-medium" style={{ color: 'var(--text-secondary)', fontSize: 14 }}>정보를 불러올 수 없습니다.</p>
        <button onClick={() => refetch()} className="px-4 py-2 rounded-lg font-semibold text-white" style={{ backgroundColor: 'var(--royal-blue)', fontSize: 14 }}>다시 시도</button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* HERO + T1/T2 */}
      <section className={`${styles.section} ${styles.heroWrap}`}>
        <div className={styles.sectionList}>
          <div className={styles.heroHeader}>
            <h1 className={styles.heroTitle}>{title}</h1>
            <div className={styles.t1t2Toggle}>
              <button type="button" className={t1t2 === 'T1' ? styles.active : ''} onClick={() => setT1t2('T1')}>T1</button>
              <button type="button" className={t1t2 === 'T2' ? styles.active : ''} onClick={() => setT1t2('T2')}>T2</button>
            </div>
          </div>
          <div className={styles.heroPrice}>{priceDisplay}</div>
          {changeText && <div className={styles.heroChange} style={{ color: isUp ? '#22C55E' : '#EF4444' }}>{changeText}</div>}
          <div className={styles.heroMeta}>{usdDisplay}</div>
        </div>
      </section>

      {/* PREVIEW */}
      {item && (
        <section className={`${styles.section} ${styles.previewSection}`}>
          <div className={styles.previewLeft}>
            <img src={item.thumbnail_url || '/sample-bright.jpg'} alt="" className={styles.previewMedia} />
          </div>
          <div className={styles.previewRight}>
            {item.youtube_video_id && (
              <div className={styles.previewVideoWrap}>
                <iframe
                  src={`https://www.youtube.com/embed/${item.youtube_video_id}?autoplay=0&mute=1`}
                  title="미리보기"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                <div
                  className={`${styles.previewPlayOverlay} ${videoPlaying ? styles.hidden : ''}`}
                  onClick={() => {
                    setVideoPlaying(true);
                    const iframe = document.querySelector(`iframe[title="미리보기"]`) as HTMLIFrameElement;
                    if (iframe?.src) iframe.src = iframe.src.replace('autoplay=0', 'autoplay=1');
                  }}
                  aria-hidden={videoPlaying}
                >
                  <div className={styles.previewPlayBtn}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Sticky Tabs */}
      <div className={styles.stickyTabs}>
        {TABS.map((t) => (
          <button key={t.id} type="button" onClick={() => { setActiveTab(t.id); scrollToSection(t.id); }} className={activeTab === t.id ? styles.tabActive : styles.tabInactive}>
            {t.label}
          </button>
        ))}
      </div>

      {/* CHART */}
      <section ref={(el) => { sectionRefs.current['chart'] = el; }} className={`${styles.section} ${styles.sectionChart}`}>
        <h3 className={styles.sectionTitle}>
          <span className={styles.sectionTitleIcon} style={{ background: 'rgba(37,99,235,0.15)', color: '#2563EB' }}><TrendingUp size={14} /></span>
          가격 차트
        </h3>
        <RealPriceChart priceKrw={sharePriceKrw} loading={loading} height={420} theme="light" />
      </section>

      {/* TRADE */}
      <section ref={(el) => { sectionRefs.current['orderbook'] = el; }} className={`${styles.section} ${styles.sectionTrade}`}>
        <h3 className={styles.sectionTitle}>
          <span className={styles.sectionTitleIcon} style={{ background: 'rgba(5,150,105,0.15)', color: '#059669' }}><BarChart3 size={14} /></span>
          호가 · 주문
        </h3>
        <div className={styles.tradeGrid}>
          <div className={styles.tradePanel}><MockOrderBook basePriceKrw={sharePriceKrw} loading={loading} theme="light" /></div>
          <div className={`${styles.tradePanel} ${styles.orderPanel}`}>
            <div className={styles.orderTypeTabs}>
              {(['limit', 'market'] as const).map((t) => (
                <button key={t} type="button" className={orderType === t ? styles.active : ''} onClick={() => setOrderType(t)}>{t === 'limit' ? '지정가' : '시장가'}</button>
              ))}
            </div>
            <input className={styles.orderInput} placeholder="가격" value={orderPrice} onChange={(e) => setOrderPrice(e.target.value)} />
            <input className={styles.orderInput} placeholder="수량" value={orderQty} onChange={(e) => setOrderQty(e.target.value)} />
            <div className={styles.orderPctRow}>
              {[25, 50, 75, 100].map((p) => <button key={p} type="button" onClick={() => setQtyPercent(p)}>{p}%</button>)}
            </div>
            <div className={styles.orderSummary}>
              <div className={styles.orderSummaryRow}><span>예상 체결금액</span><span>{orderTotal > 0 ? formatKrw(orderTotal) : '—'}</span></div>
              <div className={styles.orderSummaryRow}><span>수수료 (0.03%)</span><span>{orderFee > 0 ? formatKrw(orderFee) : '—'}</span></div>
              <div className={`${styles.orderSummaryRow} ${styles.total}`}><span>총액</span><span>{orderTotal > 0 ? formatKrw(orderTotal + orderFee) : '—'}</span></div>
            </div>
            <div className={styles.orderBtnRow}>
              <button type="button" className={styles.orderBtnBuy}>매수</button>
              <button type="button" className={styles.orderBtnSell}>매도</button>
            </div>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <section ref={(el) => { sectionRefs.current['trades'] = el; }} className={`${styles.section} ${styles.sectionTicker}`}>
        <h3 className={styles.sectionTitle}>
          <span className={styles.sectionTitleIcon} style={{ background: 'rgba(124,58,237,0.15)', color: '#7C3AED' }}><PieChart size={14} /></span>
          실시간 체결
        </h3>
        <div className={styles.tickerList}>
          {TICKER_MOCK.map((t, i) => (
            <div key={i} className={styles.tickerRow}>
              <span style={{ color: t.side === 'buy' ? '#2563EB' : '#DC2626' }}>{formatKrw(t.price)}</span>
              <span style={{ color: '#6B7280' }}>{t.qty}주</span>
              <span style={{ fontSize: 12, color: '#9CA3AF' }}>{t.time}</span>
            </div>
          ))}
        </div>
      </section>

      {/* INVEST */}
      <section ref={(el) => { sectionRefs.current['invest'] = el; }} className={`${styles.section} ${styles.sectionInvest}`}>
        <h3 className={styles.sectionTitle}>
          <span className={styles.sectionTitleIcon} style={{ background: 'rgba(217,119,6,0.15)', color: '#D97706' }}><BookOpen size={14} /></span>
          투자정보
        </h3>
        <div className={styles.investBlock}>
          <DividendInfo payoutDay={item?.payout_day ?? 3} dividendMonthlyRate={item?.dividend_monthly_rate} dividendMonthlyUsdPerShare={item?.dividend_monthly_usd_per_share} sharePriceUsd={sharePriceUsd} fxRate={fxRate} />
        </div>
        <div className={styles.investBlock}>
          <div className={styles.investBlockTitle}>배당 시뮬레이터</div>
          <DividendSimulatorV2 sharePriceKrw={sharePriceKrw} dividendPerShare={item?.dividendPerShare ?? 360} expectedAnnualYield={item?.expectedAnnualYield ?? item?.yield_rate ?? 8.4} monthlyRevenue={item?.monthlyRevenue ?? 120_000_000} dividendRatio={item?.dividendRatio ?? 0.3} totalShares={item?.total_shares ?? 100_000} loading={loading} error={error ? '정보를 불러올 수 없습니다' : null} />
        </div>
        <div className={styles.investBlock}>
          <div className={styles.investBlockTitle}>청약 정보</div>
          <div className={styles.investRow}><span>모집 목표</span><span>₩500,000,000</span></div>
          <div className={styles.investRow}><span>현재 모집</span><span>₩312,500,000 (62.5%)</span></div>
          <div className={styles.investRow}><span>청약 마감</span><span>2025-04-30</span></div>
        </div>
      </section>

      {/* PROJECT */}
      <section ref={(el) => { sectionRefs.current['project'] = el; }} className={`${styles.section} ${styles.sectionProject}`}>
        <h3 className={styles.sectionTitle}>
          <span className={styles.sectionTitleIcon} style={{ background: 'rgba(3,105,161,0.15)', color: '#0369A1' }}><Users size={14} /></span>
          프로젝트 정보
        </h3>
        <div className={styles.projectContent}>
          <p style={{ marginBottom: 12 }}>스토리, 재무 현황, 팀 소개 등 프로젝트 상세 설명이 제공됩니다.</p>
          <p style={{ marginBottom: 0 }}>투자 시 유의사항 및 리스크 요인을 확인해 주세요.</p>
        </div>
      </section>

      {/* NEWS */}
      <section ref={(el) => { sectionRefs.current['news'] = el; }} className={`${styles.section} ${styles.sectionNews}`}>
        <h3 className={styles.sectionTitle}>
          <span className={styles.sectionTitleIcon} style={{ background: 'rgba(190,24,93,0.15)', color: '#BE185D' }}><Newspaper size={14} /></span>
          관련 뉴스
        </h3>
        <div className={styles.newsList}>
          {NEWS_MOCK.map((n) => (
            <a key={n.id} href="#" className={styles.newsItem} onClick={(e) => e.preventDefault()}>
              <img src={n.imageUrl} alt="" className={styles.newsThumb} />
              <div className={styles.newsBody}>
                <div className={styles.newsTitle}>{n.title}</div>
                <div className={styles.newsMeta}>{n.date}</div>
                <div className={styles.newsSummary}>{n.summary}</div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* CHAT */}
      <section ref={(el) => { sectionRefs.current['chat'] = el; }} className={`${styles.section} ${styles.sectionChat}`}>
        <h3 className={styles.sectionTitle}>
          <span className={styles.sectionTitleIcon} style={{ background: 'rgba(75,85,99,0.15)', color: '#4B5563' }}><MessageCircle size={14} /></span>
          실시간 채팅
        </h3>
        <LiveChatMock />
      </section>

      {showScrollTop && (
        <button type="button" className={styles.scrollTopBtn} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="맨 위로">
          <ArrowUp size={22} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}

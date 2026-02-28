'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useMarketItem } from '@/hooks/useMarketItem';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/components/auth/AuthProvider';
import { formatKrw, formatRate } from '@/lib/utils/format';
import RealPriceChart from '@/components/market/RealPriceChart';
import LiveTradesMock from '@/components/market/LiveTradesMock';
import TradingPanelV2 from '@/components/market/TradingPanelV2';
import DepthRibbon from '@/components/market/DepthRibbon';
import { ArrowUp } from 'lucide-react';
import { FALLBACK_PREVIEW_IMAGE, PRODUCT_PLACEHOLDER } from '@/lib/thumbnails';
import BottomNavigation from '@/components/home/BottomNavigation';
import styles from './market-detail.module.css';

export default function MarketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const { id } = React.use(params);
  const { item, loading, error, refetch } = useMarketItem(id);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [tab, setTab] = useState<'info' | 'order' | 'quote'>('info');
  const [t1t2, setT1t2] = useState<'T1' | 'T2'>('T1');
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [lastTradePrice, setLastTradePrice] = useState(0);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const onScroll = () => setShowScrollTop(typeof window !== 'undefined' && window.scrollY > 300);
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const title = item?.title ?? '—';
  const fxRate = item?.fx_rate ?? 1350;
  const sharePriceUsd = item?.share_price_usd ?? 10;
  const sharePriceKrw = sharePriceUsd * fxRate;
  const prevCloseUsd = sharePriceUsd * 0.98;
  const changeRate = ((sharePriceUsd - prevCloseUsd) / prevCloseUsd) * 100;
  const changeAmountKrw = (sharePriceUsd - prevCloseUsd) * fxRate;
  const isUp = changeRate > 0;
  useEffect(() => {
    if (!loading && sharePriceKrw > 0) setLastTradePrice(Math.round(sharePriceKrw));
  }, [loading, sharePriceKrw]);

  const changeText = changeRate !== 0 || changeAmountKrw !== 0
    ? `${isUp ? '+' : ''}${formatRate(changeRate)} (${isUp ? '+' : ''}${Math.round(changeAmountKrw).toLocaleString('ko-KR')})`
    : null;
  const priceDisplay = loading ? '—' : formatKrw(sharePriceKrw);
  const usdDisplay = loading ? '—' : `$${sharePriceUsd.toFixed(2)} USD`;
  const tradesCount = (item as Record<string, unknown>)?.last_24h_count ?? (item as Record<string, unknown>)?.last_1h_count ?? 112;

  if (error && !item) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <p className={styles.errorText}>정보를 불러올 수 없습니다.</p>
          <button onClick={() => refetch()} className={styles.retryBtn}>다시 시도</button>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* 1) 상단 배너 썸네일 */}
        {item && (
          <section className={styles.bannerSection}>
            <div className={styles.bannerWrap}>
              {item.youtube_video_id ? (
                <div className={styles.bannerVideoWrap}>
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
              ) : (
                <img
                  src={item.thumbnail_url || FALLBACK_PREVIEW_IMAGE}
                  alt=""
                  className={styles.bannerImg}
                  onError={(e) => {
                    const el = e.currentTarget;
                    if (!el.src.includes('placeholders/')) el.src = PRODUCT_PLACEHOLDER;
                  }}
                />
              )}
            </div>
          </section>
        )}

        {/* 2) 종목 헤더 (영상형 촘촘) */}
        <section className={styles.headerSection}>
          <div className={styles.heroTitleRow}>
            <h1 className={styles.headerTitle}>{title}</h1>
            <div className={styles.t1t2Toggle}>
              <button type="button" className={t1t2 === 'T1' ? styles.t1t2Active : ''} onClick={() => setT1t2('T1')}>T1</button>
              <button type="button" className={t1t2 === 'T2' ? styles.t1t2Active : ''} onClick={() => setT1t2('T2')}>T2</button>
            </div>
          </div>
          <div className={styles.heroPriceRow}>
            <span className={styles.priceValue}>{priceDisplay}</span>
            {changeText && <span className={`${styles.changeBadge} ${isUp ? styles.changeUp : styles.changeDown}`}>{changeText}</span>}
            <span className={styles.heroPills}>
              <span className={styles.pillLive}>LIVE</span>
              <span className={styles.pillTrades}>trades {typeof tradesCount === 'number' ? tradesCount : 112}</span>
            </span>
          </div>
          <div className={styles.heroMetaWrap}>
            <span className={styles.usdText}>{usdDisplay}</span>
          </div>
        </section>

        {/* 3) 탭 바 */}
        <div className={styles.tabBar}>
          <button type="button" className={tab === 'info' ? styles.tabActive : styles.tabInactive} onClick={() => setTab('info')}>
            정보
          </button>
          <button type="button" className={tab === 'order' ? styles.tabActive : styles.tabInactive} onClick={() => setTab('order')}>
            주문
          </button>
          <button type="button" className={tab === 'quote' ? styles.tabActive : styles.tabInactive} onClick={() => setTab('quote')}>
            시세
          </button>
        </div>

        {/* 4) 탭 콘텐츠 */}
        {tab === 'info' && (
          <section className={styles.tabContent}>
            {/* A) 투자 개요 */}
            <div className={styles.infoCard}>
              <div className={styles.infoTitle}>투자 개요</div>
              <div className={styles.kvRow}>
                <span className={styles.kvLabel}>총 투자 모집액</span>
                <span className={styles.kvValue}>
                  {loading ? '—' : formatKrw(
                    (() => {
                      const it = item as Record<string, unknown> | null;
                      const v = it?.total_raise_krw ?? it?.raise_krw ?? it?.total_krw ??
                        (typeof it?.total_raise === 'number' ? it.total_raise : null) ??
                        (typeof it?.total_raise_usd === 'number' ? (it.total_raise_usd as number) * fxRate : null) ??
                        1_000_000_000;
                      return Number(v);
                    })()
                  )}
                </span>
              </div>
              <div className={styles.kvRow}>
                <span className={styles.kvLabel}>주당 가격</span>
                <span className={styles.kvValue}>{loading ? '—' : formatKrw(sharePriceKrw)}</span>
              </div>
              <div className={styles.kvRow}>
                <span className={styles.kvLabel}>카테고리</span>
                <span className={styles.kvValue}>
                  {(item as any)?.category_name ?? (item as any)?.category ?? (item as any)?.tags?.[0] ?? '웹툰'}
                </span>
              </div>
              <div className={styles.kvRow}>
                <span className={styles.kvLabel}>예상 수익률</span>
                <span className={styles.kvValue}>
                  {loading ? '—' : `${((item as any)?.expected_yield_rate ?? (item as any)?.yield_rate ?? (item as any)?.expectedAnnualYield ?? 15.5)}%`}
                </span>
              </div>
            </div>

            {/* B) 수익 배분율 */}
            <div className={styles.infoCard}>
              <div className={styles.infoTitle}>수익 배분율</div>
              <div className={styles.bars}>
                <div className={styles.barRow}>
                  <span className={styles.barLabel}>창작자</span>
                  <div className={styles.barTrack}>
                    <div className={styles.barFill} style={{ width: '50%', background: '#6D28D9' }} />
                  </div>
                  <span className={styles.barPct}>50%</span>
                </div>
                <div className={styles.barRow}>
                  <span className={styles.barLabel}>투자자</span>
                  <div className={styles.barTrack}>
                    <div className={styles.barFill} style={{ width: '47%', background: '#2563EB' }} />
                  </div>
                  <span className={styles.barPct}>47%</span>
                </div>
                <div className={styles.barRow}>
                  <span className={styles.barLabel}>수수료</span>
                  <div className={styles.barTrack}>
                    <div className={styles.barFill} style={{ width: '3%', background: '#6B7280' }} />
                  </div>
                  <span className={styles.barPct}>3%</span>
                </div>
              </div>
            </div>

            {/* C) 투자 계획 */}
            <div className={styles.infoCard}>
              <div className={styles.infoTitle}>투자 계획</div>
              <div className={styles.planBody}>
                {(item as any)?.plan ?? (item as any)?.description ?? (item as any)?.summary ?? '글로벌 3억 뷰 달성 예정! 대작 웹툰의 주인이 되세요.'}
              </div>
              <a
                href="/dummy-investment-plan.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.planPdfBtn}
              >
                PDF 다운로드
              </a>
            </div>

            {/* D) 작가의 기획 PDF */}
            {typeof (item as Record<string, unknown>)?.creator_plan_pdf === 'string' && (
              <section className={styles.creatorPlan}>
                <h3>작가의 기획</h3>
                <a
                  href={(item as Record<string, unknown>).creator_plan_pdf as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.downloadBtn}
                >
                  PDF 다운로드
                </a>
              </section>
            )}
          </section>
        )}

        {tab === 'order' && id && (
          <section ref={(el) => { sectionRefs.current['orderbook'] = el; }} className={styles.tabContent}>
            <div className={styles.tradingTop}>
              <TradingPanelV2 currentPriceKrw={lastTradePrice || sharePriceKrw} />
            </div>
            <div className={styles.orderBookWrap}>
              <DepthRibbon midPriceKrw={lastTradePrice || sharePriceKrw} />
            </div>
            <div className={styles.bottomNav}>
              <button type="button" className={styles.listBtn} onClick={() => router.push('/market')}>
                목록
              </button>
              <button type="button" className={styles.walletBtn} onClick={() => router.push('/wallet')}>
                지갑
              </button>
            </div>
          </section>
        )}

        {tab === 'quote' && (
          <section className={styles.tabContent}>
            <div className={styles.chartSection}>
              <div className={styles.card}>
                <h3 className={styles.sectionTitle}>가격 차트</h3>
                <RealPriceChart priceKrw={lastTradePrice || sharePriceKrw} loading={loading} height={280} theme="light" />
              </div>
            </div>
            <div className={styles.tradeSection}>
              <div className={styles.card}>
                <h3 className={styles.sectionTitle}>실시간 체결</h3>
                <LiveTradesMock basePriceKrw={sharePriceKrw} />
              </div>
            </div>
            <div className={styles.tradeSection}>
              <DepthRibbon midPriceKrw={lastTradePrice || sharePriceKrw} dense />
            </div>
          </section>
        )}

        {showScrollTop && (
          <button type="button" className={styles.scrollTopBtn} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="맨 위로">
            <ArrowUp size={22} strokeWidth={2.5} />
          </button>
        )}
      </div>
      <BottomNavigation />
    </div>
  );
}

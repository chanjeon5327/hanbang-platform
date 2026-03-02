'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMarketItem } from '@/hooks/useMarketItem';
import { useAuth } from '@/components/auth/AuthProvider';
import { formatKrw } from '@/lib/utils/format';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import RealPriceChart from '@/components/market/RealPriceChart';
import LiveTradesMock from '@/components/market/LiveTradesMock';
import TradingPanelV2 from '@/components/market/TradingPanelV2';
import MusicowAssetHeader from '@/components/market/MusicowAssetHeader';
import MusicowOrderBook from '@/components/market/MusicowOrderBook';
import TradeBottomSheet from '@/components/market/TradeBottomSheet';
import TradeActionDock from '@/components/market/TradeActionDock';
import { ArrowUp } from 'lucide-react';
import styles from './market-detail.module.css';

type TabType = 'trade' | 'quote' | 'info';

export default function MarketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { user } = useAuth();
  const { id } = React.use(params);
  const { item, loading, error, refetch } = useMarketItem(id);

  const [showScrollTop, setShowScrollTop] = useState(false);
  const [tab, setTab] = useState<TabType>('info');
  const [lastTradePrice, setLastTradePrice] = useState(0);
  const [positionQty, setPositionQty] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastOrderLine, setLastOrderLine] = useState<string | null>(null);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetSide, setSheetSide] = useState<'buy' | 'sell'>('buy');

  useEffect(() => {
    const onScroll = () => setShowScrollTop(typeof window !== 'undefined' && window.scrollY > 300);
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const fxRate = (item as any)?.fx_rate ?? 1350;
  const sharePriceUsd = (item as any)?.share_price_usd ?? 10;
  const sharePriceKrw = sharePriceUsd * fxRate;

  useEffect(() => {
    if (!loading && sharePriceKrw > 0) setLastTradePrice(Math.round(sharePriceKrw));
  }, [loading, sharePriceKrw]);

  const fetchPositionQty = useCallback(() => {
    if (!user || !id) return;
    fetch(`/api/wallet/position?asset_id=${id}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => setPositionQty(Number(j?.quantity ?? 0)))
      .catch(() => setPositionQty(0));
  }, [user, id]);

  useEffect(() => {
    fetchPositionQty();
  }, [fetchPositionQty]);

  useEffect(() => {
    const handler = (e: CustomEvent<{ assetId: string; payload?: { side: string; type: string; qty: number }; result?: { url: string; data: unknown } }>) => {
      const { assetId: evAssetId, payload } = e.detail ?? {};
      if (evAssetId !== id) return;
      setSheetOpen(false);
      setRefreshKey((k) => k + 1);
      if (payload) {
        const sideKr = payload.side === 'buy' ? '매수' : '매도';
        const typeKr = payload.type === 'market' ? '시장가' : '지정가';
        setLastOrderLine(`방금 ${sideKr} ${payload.qty}주 ${typeKr} 주문 접수`);
      }
      fetchPositionQty();
    };
    window.addEventListener('hb:order-placed', handler as EventListener);
    return () => window.removeEventListener('hb:order-placed', handler as EventListener);
  }, [id, fetchPositionQty]);

  if (error && !item) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <p className={styles.errorText}>정보를 불러올 수 없습니다.</p>
          <button onClick={() => refetch()} className={styles.retryBtn}>
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  const priceKrw = lastTradePrice || sharePriceKrw;
  const prevCloseUsd = sharePriceUsd * 0.98;
  const changeRate = ((sharePriceUsd - prevCloseUsd) / prevCloseUsd) * 100;
  const title = (item as any)?.title ?? '—';
  const thumbnailUrl = (item as any)?.thumbnail_url ?? null;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* 1) 뮤직카우 헤더 (썸네일 + 현재가 + 등락률) */}
        <MusicowAssetHeader
          title={title}
          thumbnailUrl={thumbnailUrl}
          priceKrw={priceKrw}
          changeRate={changeRate}
        />

        {/* 2) 탭 바: 정보 | 시세 | 거래 */}
        <div className={styles.tabBar}>
          <button
            type="button"
            className={tab === 'info' ? styles.tabActive : styles.tabInactive}
            onClick={() => setTab('info')}
          >
            정보
          </button>
          <button
            type="button"
            className={tab === 'quote' ? styles.tabActive : styles.tabInactive}
            onClick={() => setTab('quote')}
          >
            시세
          </button>
          <button
            type="button"
            className={tab === 'trade' ? styles.tabActive : styles.tabInactive}
            onClick={() => setTab('trade')}
          >
            거래
          </button>
        </div>

        {/* 3) 거래 탭: 호가 중심 + 내 거래 요약 + 하단 4버튼 */}
        {tab === 'trade' && id && (
          <section className={styles.tabContent} style={{ paddingBottom: 140 }}>
            {lastOrderLine && (
              <div className="mb-2 text-center text-xs text-emerald-600" aria-live="polite">
                {lastOrderLine}
              </div>
            )}

            {/* 내 거래 요약 (보유 수량) */}
            {positionQty > 0 && (
              <div className={styles.infoCard} style={{ borderLeft: '4px solid var(--emerald)', marginBottom: 12 }}>
                <div className={styles.infoTitle}>내 보유</div>
                <div className={styles.kvRow}>
                  <span className={styles.kvLabel}>보유 수량</span>
                  <span className={styles.kvValue}>{positionQty}주</span>
                </div>
                <div className={styles.kvRow}>
                  <span className={styles.kvLabel}>평가금액</span>
                  <span className={styles.kvValue}>{formatKrw(positionQty * priceKrw)}</span>
                </div>
              </div>
            )}

            {/* 호가창 */}
            <MusicowOrderBook key={`orderbook-${refreshKey}`} basePriceKrw={priceKrw} />

            {/* 하단 4버튼 (구매/판매/주문수정/체결내역) */}
            <TradeActionDock
              onBuy={() => {
                setSheetSide('buy');
                setSheetOpen(true);
              }}
              onSell={() => {
                setSheetSide('sell');
                setSheetOpen(true);
              }}
              onEdit={() => router.push('/mypage/orders')}
              onFills={() => router.push('/mypage/orders')}
            />
          </section>
        )}

        {/* 4) 시세 탭: 차트 + 체결 */}
        {tab === 'quote' && id && (
          <section className={styles.tabContent}>
            <div className={styles.panelCard}>
              <h3 className={styles.terminalTitle}>가격 차트</h3>
              <div className={styles.chartWrap}>
                <RealPriceChart key={`chart-${refreshKey}`} priceKrw={priceKrw} loading={loading} height={280} theme="light" />
              </div>
            </div>
            <div className={styles.panelCard}>
              <h3 className={styles.terminalTitle}>실시간 체결</h3>
              <LiveTradesMock key={`trades-${refreshKey}`} basePriceKrw={sharePriceKrw} />
            </div>
          </section>
        )}

        {/* 5) 정보 탭 */}
        {tab === 'info' && (
          <section className={styles.tabContent}>
            {positionQty > 0 && (
              <div className={styles.infoCard} style={{ borderLeft: '4px solid var(--emerald)' }}>
                <div className={styles.infoTitle}>내 예상 수익</div>
                <div className={styles.kvRow}>
                  <span className={styles.kvLabel}>보유 수량</span>
                  <span className={styles.kvValue}>{positionQty}주</span>
                </div>
                <div className={styles.kvRow}>
                  <span className={styles.kvLabel}>월 예상 배당 (최근 기준)</span>
                  <span className={styles.kvValue} style={{ color: 'var(--emerald)', fontWeight: 700 }}>
                    <AnimatedNumber
                      value={
                        positionQty *
                        (((item as any)?.dividend_monthly_usd_per_share ?? (item as any)?.dividendPerShare ?? 0) * fxRate)
                      }
                      duration={600}
                      format="krw"
                    />
                  </span>
                </div>
              </div>
            )}

            <div className={styles.infoCard}>
              <div className={styles.infoTitle}>투자 개요</div>
              <div className={styles.kvRow}>
                <span className={styles.kvLabel}>총 투자 모집액</span>
                <span className={styles.kvValue}>
                  {loading
                    ? '—'
                    : formatKrw(
                        (() => {
                          const it = item as Record<string, unknown> | null;
                          const v =
                            (it as any)?.total_raise_krw ??
                            (it as any)?.raise_krw ??
                            (it as any)?.total_krw ??
                            (typeof (it as any)?.total_raise === 'number' ? (it as any).total_raise : null) ??
                            (typeof (it as any)?.total_raise_usd === 'number' ? (it as any).total_raise_usd * fxRate : null) ??
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
                  {loading
                    ? '—'
                    : `${(item as any)?.expected_yield_rate ?? (item as any)?.yield_rate ?? (item as any)?.expectedAnnualYield ?? 15.5}%`}
                </span>
              </div>
            </div>

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

            <div className={styles.infoCard}>
              <div className={styles.infoTitle}>투자 계획</div>
              <div className={styles.planBody}>
                {(item as any)?.plan ??
                  (item as any)?.description ??
                  (item as any)?.summary ??
                  '글로벌 3억 뷰 달성 예정! 대작 웹툰의 주인이 되세요.'}
              </div>
              <a href="/dummy-investment-plan.pdf" target="_blank" rel="noopener noreferrer" className={styles.planPdfBtn}>
                PDF 다운로드
              </a>
            </div>

            <section className={styles.creatorPlan}>
              <h3>작가의 기획</h3>
              {(() => {
                const pdfUrl = (item as any)?.plan_pdf_url ?? (item as any)?.creator_plan_pdf;
                if (typeof pdfUrl === 'string' && pdfUrl) {
                  return (
                    <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className={styles.downloadBtn}>
                      PDF 다운로드
                    </a>
                  );
                }
                return (
                  <span className={styles.planPdfBtn} style={{ opacity: 0.7, cursor: 'default', pointerEvents: 'none' }}>
                    자료 준비중
                  </span>
                );
              })()}
            </section>

            {(() => {
              const it = item as any;
              const summary = typeof it?.strategy_summary === 'string' ? it.strategy_summary : null;
              const targetMarket = typeof it?.target_market === 'string' ? it.target_market : null;
              const revenueModel = typeof it?.revenue_model === 'string' ? it.revenue_model : null;
              const coreTeam = typeof it?.core_team === 'string' ? it.core_team : null;
              const equipmentStack = typeof it?.equipment_stack === 'string' ? it.equipment_stack : null;
              const distributionPlan = typeof it?.distribution_plan === 'string' ? it.distribution_plan : null;
              const hasAny = summary || targetMarket || revenueModel || coreTeam || equipmentStack || distributionPlan;
              if (!hasAny) return null;

              return (
                <div className={styles.infoCard} style={{ marginTop: 14 }}>
                  <div className={styles.infoTitle}>작가의 전략</div>
                  {summary && <p className={styles.strategySummary}>{summary}</p>}
                  <div>
                    {targetMarket && (
                      <div className={styles.kvRow}>
                        <span className={styles.kvLabel}>타겟 시장</span>
                        <span className={styles.kvValue}>{targetMarket}</span>
                      </div>
                    )}
                    {revenueModel && (
                      <div className={styles.kvRow}>
                        <span className={styles.kvLabel}>수익 모델</span>
                        <span className={styles.kvValue}>{revenueModel}</span>
                      </div>
                    )}
                    {coreTeam && (
                      <div className={styles.kvRow}>
                        <span className={styles.kvLabel}>핵심 팀</span>
                        <span className={styles.kvValue}>{coreTeam}</span>
                      </div>
                    )}
                    {equipmentStack && (
                      <div className={styles.kvRow}>
                        <span className={styles.kvLabel}>장비/인프라</span>
                        <span className={styles.kvValue}>{equipmentStack}</span>
                      </div>
                    )}
                    {distributionPlan && (
                      <div className={styles.kvRow}>
                        <span className={styles.kvLabel}>유통 전략</span>
                        <span className={styles.kvValue}>{distributionPlan}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </section>
        )}

        {/* 바텀시트 주문 */}
        <TradeBottomSheet
          open={sheetOpen}
          title={sheetSide === 'buy' ? '구매' : '판매'}
          onClose={() => setSheetOpen(false)}
        >
          {id && (
            <TradingPanelV2
              assetId={id}
              currentPriceKrw={priceKrw}
              initialSide={sheetSide}
              initialType="limit"
            />
          )}
        </TradeBottomSheet>

        {showScrollTop && (
          <button
            type="button"
            className={styles.scrollTopBtn}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="맨 위로"
          >
            <ArrowUp size={22} strokeWidth={2.5} />
          </button>
        )}
      </div>
    </div>
  );
}

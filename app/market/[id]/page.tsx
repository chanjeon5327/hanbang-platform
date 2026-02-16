'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Moon, Sun, Share2, Check } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import YouTubeEmbed from '@/components/common/YouTubeEmbed';
import MarketStatsBar from '@/components/market/MarketStatsBar';
import ExpectedReturnBox from '@/components/market/ExpectedReturnBox';
import TrustBadges from '@/components/market/TrustBadges';
import RecentInvestLog from '@/components/market/RecentInvestLog';
import InvestConfirmModal from '@/components/market/InvestConfirmModal';
import DividendInfo from '@/components/market/DividendInfo';
import Toast from '@/components/ui/Toast';
import { useMarketItem } from '@/hooks/useMarketItem';
import { useRecentInvestLog } from '@/hooks/useRecentInvestLog';
import { useArtistContribution } from '@/hooks/useArtistContribution';
import { useArtistProgress } from '@/hooks/useArtistProgress';
import { formatKrw, formatRate } from '@/lib/utils/format';
import DividendCard from '@/components/market/DividendCard';
import ProductStorySection from '@/components/market/ProductStorySection';
import ProductPitchDeckSection from '@/components/market/ProductPitchDeckSection';
import DividendExplainSection from '@/components/market/DividendExplainSection';
import DividendSimulatorV2 from '@/components/market/DividendSimulatorV2';
import ExchangeSection from '@/components/market/ExchangeSection';
import Skeleton from '@/components/ui/Skeleton';
import { CardV5 } from '@/components/ui/CardV5';
import MetricRow from '@/components/ui/MetricRow';
import Divider from '@/components/ui/Divider';
import TopAppBar from '@/components/ui/TopAppBar';
import { useAuth } from '@/components/auth/AuthProvider';

const YT_FALLBACK = 'HosW0gulISQ';
const YT_START_SEC = 25;
const DEFAULT_AMOUNT = 100_000;
/** 스크롤 테스트용: true면 각 섹션에 1px debug outline 표시, 정렬 확인 후 false로 변경 */
const DEBUG_SECTIONS = false;

type TabKey = 'info' | 'trade' | 'invest';

function calcProgress(total?: number | null, current?: number | null): number {
  if (total != null && total > 0 && current != null) {
    return Math.min(100, Math.round((current / total) * 100));
  }
  return 0;
}

function isDeadlineSoon(deadline: string | null | undefined): boolean {
  if (!deadline) return false;
  const d = new Date(deadline);
  const now = new Date();
  const diffDays = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 3;
}

function DetailHeader({ onShare }: { onShare?: () => void }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <TopAppBar
      title=""
      backHref="/market"
      backLabel="마켓으로"
      right={
        <div className="flex items-center gap-1">
          {onShare && (
            <button
              type="button"
              onClick={onShare}
              className="p-2 rounded-lg transition hover:opacity-80"
              style={{ color: 'var(--text-secondary)' }}
              aria-label="공유"
            >
              <Share2 size={20} strokeWidth={2} />
            </button>
          )}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg transition hover:opacity-80"
            style={{ color: 'var(--text-secondary)' }}
            aria-label={theme === 'light' ? '다크 모드' : '라이트 모드'}
          >
            {theme === 'light' ? <Moon size={22} strokeWidth={2} /> : <Sun size={22} strokeWidth={2} />}
          </button>
        </div>
      }
    />
  );
}

function MediaHero({
  ytId,
  loading,
  title,
  platform,
  category,
  isPopular,
  deadlineSoon,
}: {
  ytId: string;
  loading: boolean;
  title: string;
  platform: string;
  category: string;
  isPopular: boolean;
  deadlineSoon: boolean;
}) {
  return (
    <section className="relative w-full overflow-hidden" style={{ aspectRatio: '16/9', backgroundColor: 'var(--border)' }}>
      {loading ? (
        <Skeleton className="w-full h-full" />
      ) : (
        <YouTubeEmbed
          videoId={ytId}
          className="!rounded-none h-full w-full"
          title="작품 미리보기"
          autoplay
          mute
          controls
          loop={false}
          start={YT_START_SEC}
          fill
        />
      )}
      <div className="absolute top-0 left-0 p-4 flex gap-2" style={{ padding: 'var(--space-md)' }}>
        {isPopular && (
          <span className="caption font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--emerald)', color: '#fff' }}>
            인기
          </span>
        )}
        {deadlineSoon && (
          <span className="caption font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--accent-loss)', color: '#fff' }}>
            마감임박
          </span>
        )}
      </div>
      <div
        className="absolute bottom-0 left-0 right-0 p-4 flex flex-col justify-end"
        style={{
          padding: 'var(--space-md)',
          background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
        }}
      >
        <h2 className="h2 font-bold" style={{ color: '#fff' }}>{title}</h2>
        <p className="caption mt-1" style={{ color: 'rgba(255,255,255,0.9)' }}>{platform} · {category}</p>
      </div>
    </section>
  );
}

function SummaryFinancialCard({
  currentPriceKrw,
  expectedYield,
  progress,
  participants,
  todayCount,
  integrityOk,
  settlementCount,
  cumulativeDividend,
  avgMonthlyDividend,
  contentId,
}: {
  currentPriceKrw: number;
  expectedYield: number;
  progress: number;
  participants: number;
  todayCount: number;
  integrityOk?: boolean;
  settlementCount?: number;
  cumulativeDividend?: number | null;
  avgMonthlyDividend?: number | null;
  contentId?: string;
}) {
  const extraMetrics = [
    { label: '누적 배당 지급액', value: cumulativeDividend != null && cumulativeDividend > 0 ? formatKrw(cumulativeDividend) : '—' },
    { label: '정산 횟수', value: settlementCount != null ? `${settlementCount}건` : '—' },
    { label: '평균 월배당', value: avgMonthlyDividend != null ? formatKrw(avgMonthlyDividend) : '—' },
  ];
  return (
    <CardV5 style={{ marginTop: 'var(--space-lg)' }} className="card-inner-gap">
      <div>
        <div className="metric-xl metric-number font-extrabold" style={{ color: 'var(--text)' }}>
          {formatKrw(currentPriceKrw)}
        </div>
        <p className="caption" style={{ color: 'var(--text-secondary)' }}>현재가</p>
      </div>
      <div>
        <div className="metric-lg metric-number font-bold" style={{ color: 'var(--emerald)' }}>
          {formatRate(expectedYield)}
        </div>
        <p className="caption" style={{ color: 'var(--text-secondary)' }}>예상 연수익률</p>
      </div>
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="caption" style={{ color: 'var(--text-secondary)' }}>모집률</span>
          <span className="caption font-bold metric-number" style={{ color: 'var(--text)' }}>{progress.toFixed(1)}%</span>
        </div>
        <div className="w-full rounded-full overflow-hidden" style={{ height: 8, backgroundColor: 'var(--border)' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${Math.min(100, progress)}%`, backgroundColor: 'var(--royal-blue)' }}
          />
        </div>
      </div>
      <p className="caption metric-number" style={{ color: 'var(--text-secondary)' }}>
        {participants}명 참여 · 오늘 확정 {todayCount}건
      </p>
      <MetricRow items={extraMetrics} columns={3} dense />
      <Divider />
      <div className="flex flex-wrap items-center gap-2 pt-2">
        <span className="inline-flex items-center gap-1 caption px-2 py-0.5 rounded-full border" style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
          <Check size={10} style={{ color: 'var(--emerald)' }} />
          원장 기록 기반
        </span>
        <span className="inline-flex items-center gap-1 caption px-2 py-0.5 rounded-full border" style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
          <span className="w-1 h-1 rounded-full bg-[var(--emerald)] animate-pulse" style={{ animationDuration: '1.5s' }} />
          실시간 체결 데이터
        </span>
        <Link
          href="/trust"
          className="caption font-medium underline"
          style={{ color: 'var(--royal-blue)' }}
        >
          정산 이력 공개
        </Link>
      </div>
    </CardV5>
  );
}

function TabNavigation({
  activeTab,
  onTabChange,
  isTradable,
}: {
  activeTab: TabKey;
  onTabChange: (t: TabKey) => void;
  isTradable: boolean;
}) {
  const tabs: { key: TabKey; label: string }[] = [
    { key: 'info', label: '정보' },
    { key: 'trade', label: '거래' },
    { key: 'invest', label: '투자' },
  ];
  return (
    <nav
      className="sticky top-14 z-40 flex border-b"
      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
    >
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => onTabChange(t.key)}
          disabled={t.key === 'trade' && !isTradable}
          className="flex-1 py-3 body-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            color: activeTab === t.key ? 'var(--royal-blue)' : 'var(--text-secondary)',
            borderBottom: activeTab === t.key ? '2px solid var(--royal-blue)' : '2px solid transparent',
          }}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}

export default function MarketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const [activeTab, setActiveTab] = useState<TabKey>('info');
  const [showConfirm, setShowConfirm] = useState(false);
  const [investLoading, setInvestLoading] = useState(false);
  const [investAmount, setInvestAmount] = useState(DEFAULT_AMOUNT);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('투자 완료되었습니다.');
  const [todayCount, setTodayCount] = useState<number>(0);

  const { user } = useAuth();
  const { item, loading: itemLoading, error: itemError, refetch: refetchItem } = useMarketItem(id);
  const { items: investLogs, refetch: refetchInvestLogs } = useRecentInvestLog(id);
  const { refetch: refetchContributions } = useArtistContribution(false);
  const { refetch: refetchProgress } = useArtistProgress(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('invest') === 'done') {
      refetchItem();
      refetchInvestLogs();
      refetchContributions();
      refetchProgress();
      window.dispatchEvent(new Event('invest-success'));
    }
  }, [searchParams, refetchItem, refetchInvestLogs, refetchContributions, refetchProgress]);

  useEffect(() => {
    fetch('/api/metrics/live', { cache: 'no-store' })
      .then((r) => r.json())
      .then((j) => setTodayCount(j.today_count ?? 0))
      .catch(() => {});
  }, []);

  const hasSession = !!user;
  const ytId = item?.youtube_video_id ?? YT_FALLBACK;
  const title = item?.title ?? '여행가 제이';
  const creator = item?.creator_name ?? '크리에이터';
  const category = item?.category ?? '여행';
  const platform = item?.platform ?? '유튜브';

  const productType = item?.product_type ?? 'DIVIDEND_ONLY';
  const isTradable = productType === 'DIVIDEND_TRADABLE';
  const fxRate = item?.fx_rate ?? 1350;

  const targetAmount = item?.total_raise ?? 0;
  const currentAmount = item?.current_raise ?? 0;
  const progress = useMemo(() => calcProgress(targetAmount, currentAmount), [targetAmount, currentAmount]);
  const remainingAmount = Math.max(0, targetAmount - currentAmount);
  const participants = item?.participants ?? Math.max(1, Math.floor(currentAmount / 300_000));
  const isPopular = (item?.popular_cnt ?? 0) >= 20;
  const deadlineSoon = isDeadlineSoon(item?.deadline ?? null);
  const yieldRate = item?.yield_rate ?? item?.dividend_monthly_rate ?? 8.4;
  const dday = useMemo(() => {
    const ed = item?.event_date;
    if (!ed) return null;
    const d = new Date(ed);
    const now = new Date();
    const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? diff : null;
  }, [item?.event_date]);

  const sharePriceUsd = item?.share_price_usd ?? null;
  const totalRaiseUsd = item?.total_raise_usd ?? null;
  const currentRaiseUsd = item?.current_raise_usd ?? null;
  const hasUsdData = sharePriceUsd != null || (totalRaiseUsd != null && currentRaiseUsd != null);

  const expectedYield = item?.expectedAnnualYield ?? yieldRate;
  const sharePriceKrw = (sharePriceUsd ?? 10) * fxRate;
  const dividendPerShare = item?.dividendPerShare ?? 360;

  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(typeof window !== 'undefined' ? window.location.href : '');
      setToastMessage('주소가 복사되었습니다.');
      setToastVisible(true);
    } catch {
      setToastMessage('복사에 실패했습니다.');
      setToastVisible(true);
    }
  }, []);

  const handleInvestConfirm = async () => {
    if (!hasSession) return;
    setInvestLoading(true);
    const idempotencyKey = crypto.randomUUID();
    try {
      const res = await fetch('/api/orders/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: id,
          content_id: id,
          amount: investAmount,
          idempotency_key: idempotencyKey,
        }),
      });
      const json = await res.json();
      if (json?.success) {
        setShowConfirm(false);
        setToastMessage('주문이 체결되었습니다.');
        setToastVisible(true);
        refetchItem();
        refetchInvestLogs();
        refetchContributions();
        window.dispatchEvent(new Event('invest-success'));
        window.dispatchEvent(new Event('wallet-refresh'));
      } else {
        setToastMessage(
          json?.error === 'INSUFFICIENT_FUNDS'
            ? '잔고가 부족합니다.'
            : json?.code === 'LOCK_BUSY'
              ? '잠시 후 다시 시도해 주세요.'
              : '투자에 실패했습니다.'
        );
        setToastVisible(true);
      }
    } catch {
      setToastMessage('투자에 실패했습니다.');
      setToastVisible(true);
    } finally {
      setInvestLoading(false);
    }
  };

  const ctaSubtext =
    (item?.last_1h_count ?? 0) >= 5
      ? '최근 1시간 집중 참여 중'
      : dday != null && dday <= 3
        ? '공연 전 마지막 파트너십 기회'
        : isTradable
          ? '투자 후 거래 가능'
          : '지금 참여하면 오늘 집계에 반영됩니다';

  const ctaButtonText =
    dday != null && dday <= 3
      ? `D-${dday} 공연 전 매수하기`
      : isTradable
        ? `${formatKrw(investAmount)} 매수`
        : `${formatKrw(investAmount)} 매수하기`;

  if (!itemLoading && itemError && !item) {
    return (
      <div className="flex flex-col items-center justify-center p-6" style={{ backgroundColor: 'var(--card)' }}>
        <DetailHeader onShare={handleShare} />
        <p className="body-sm mb-4" style={{ color: 'var(--text-secondary)' }}>정보를 불러올 수 없습니다.</p>
        <button
          onClick={refetchItem}
          className="px-4 py-2 rounded-lg body-sm font-semibold"
          style={{ backgroundColor: 'var(--royal-blue)', color: '#fff' }}
        >
          다시 시도
        </button>
      </div>
    );
  }

  const sectionGap = { gap: 'var(--space-lg)' };

  return (
    <div style={{ backgroundColor: 'var(--bg)' }}>
      <DetailHeader onShare={handleShare} />

      <div
        style={{
          paddingLeft: 'var(--space-lg)',
          paddingRight: 'var(--space-lg)',
          ...(DEBUG_SECTIONS ? { outline: '1px solid rgba(239,68,68,0.6)' } : {}),
        }}
      >
        <MediaHero
          ytId={ytId}
          loading={itemLoading}
          title={title}
          platform={platform}
          category={category}
          isPopular={isPopular}
          deadlineSoon={deadlineSoon}
        />
      </div>

      <div
        style={{
          paddingLeft: 'var(--space-lg)',
          paddingRight: 'var(--space-lg)',
          ...(DEBUG_SECTIONS ? { outline: '1px solid rgba(34,197,94,0.6)' } : {}),
        }}
      >
        <SummaryFinancialCard
          currentPriceKrw={sharePriceKrw}
          expectedYield={expectedYield}
          progress={progress}
          participants={participants}
          todayCount={todayCount}
          integrityOk={item?.integrity_ok ?? false}
          settlementCount={item?.settlement_count}
          cumulativeDividend={null}
          avgMonthlyDividend={dividendPerShare}
          contentId={id}
        />
      </div>

      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} isTradable={isTradable} />

      <div
        className={
          activeTab === 'trade' && isTradable ? 'pb-80' :
          activeTab === 'invest' ? 'pb-32' : 'pb-24'
        }
      >
        {activeTab === 'info' && (
          <div
            className="flex flex-col"
            style={{
              padding: 'var(--space-lg)',
              ...sectionGap,
              ...(DEBUG_SECTIONS ? { outline: '1px solid rgba(59,130,246,0.6)' } : {}),
            }}
          >
            <CardV5 className="card-inner-gap">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {item?.integrity_ok && <span className="caption px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--emerald)', color: '#fff' }}>원장</span>}
                <span className="caption px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--royal-blue)', color: '#fff' }}>실시간</span>
                {(item?.settlement_count ?? 0) > 0 && <span className="caption px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--emerald)', color: '#fff' }}>정산 {item?.settlement_count}건</span>}
              </div>
              <MetricRow
                items={[
                  { label: '현재가', value: formatKrw(sharePriceKrw) },
                  { label: '예상수익률', value: formatRate(expectedYield), tone: 'positive' },
                  { label: '참여자', value: `${participants}명` },
                ]}
                columns={3}
                dense
              />
            </CardV5>
            <ProductStorySection
              creatorStory={item?.creator_story}
              growthReason1={item?.growth_reason_1}
              growthReason2={item?.growth_reason_2}
              growthReason3={item?.growth_reason_3}
            />
            <DividendExplainSection creatorStory={item?.creator_story ?? undefined} />
            <ProductPitchDeckSection
              creatorStory={item?.creator_story ?? undefined}
              growthReason1={item?.growth_reason_1 ?? undefined}
              growthReason2={item?.growth_reason_2 ?? undefined}
              growthReason3={item?.growth_reason_3 ?? undefined}
            />
            {!hasUsdData && (
              <MarketStatsBar
                progress={progress}
                targetAmount={targetAmount}
                currentAmount={currentAmount}
                participants={participants}
                remainingAmount={remainingAmount}
                isLive
                isDeadlineSoon={deadlineSoon}
              />
            )}
            <DividendInfo
              payoutDay={item?.payout_day ?? 3}
              dividendMonthlyRate={item?.dividend_monthly_rate}
              dividendMonthlyUsdPerShare={item?.dividend_monthly_usd_per_share}
              sharePriceUsd={sharePriceUsd}
              fxRate={fxRate}
            />
            {((item?.last_1h_count ?? 0) > 0 || (item?.last_24h_amount ?? 0) > 0) && (
              <div
                className="w-full py-2 px-4 flex items-center justify-center gap-4 caption font-medium rounded-[20px]"
                style={{ backgroundColor: 'var(--midnight-navy)', color: '#C5A059', borderRadius: 'var(--radius-lg)' }}
              >
                <span className="inline-flex items-center gap-1.5 tabular-nums font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-pulse" />
                  1h {(item?.last_1h_count ?? 0)}명
                </span>
                <span className="opacity-70">|</span>
                <span className="tabular-nums font-bold">24h {formatKrw(item?.last_24h_amount ?? 0)}</span>
              </div>
            )}
            <ExpectedReturnBox yieldRate={yieldRate} defaultAmount={DEFAULT_AMOUNT} onAmountChange={setInvestAmount} />
            <div>
              <p className="caption mb-2" style={{ color: 'var(--text-secondary)' }}>최근 체결 · 정산/원장 기반</p>
              <TrustBadges />
            </div>
            <RecentInvestLog items={investLogs} />
          </div>
        )}

        {activeTab === 'trade' && (
          <div
            style={{
              padding: 'var(--space-lg)',
              ...(DEBUG_SECTIONS ? { outline: '1px solid rgba(168,85,247,0.6)' } : {}),
            }}
          >
            {isTradable ? (
              <ExchangeSection
                  contentId={id}
                  sharePriceUsd={sharePriceUsd ?? sharePriceKrw / fxRate}
                  fxRate={fxRate}
                  isTradable={isTradable}
                  isLoggedIn={hasSession}
                  userId={user?.id}
                  totalSupplyShares={
                    (sharePriceUsd ?? sharePriceKrw / fxRate) > 0 && item?.total_raise_usd != null
                      ? item.total_raise_usd / (sharePriceUsd ?? sharePriceKrw / fxRate)
                      : null
                  }
                  totalRaiseUsd={item?.total_raise_usd}
                  currentRaiseUsd={item?.current_raise_usd}
                  onToast={(msg) => {
                    setToastMessage(msg);
                    setToastVisible(true);
                  }}
                />
            ) : (
              <CardV5 className="text-center">
                <p className="body" style={{ color: 'var(--text-secondary)' }}>
                  현재는 거래가 준비 중이에요. 모집 완료 후 거래가 가능합니다.
                </p>
              </CardV5>
            )}
          </div>
        )}

        {activeTab === 'invest' && (
          <div
            className="flex flex-col"
            style={{
              padding: 'var(--space-lg)',
              ...sectionGap,
              ...(DEBUG_SECTIONS ? { outline: '1px solid rgba(245,158,11,0.6)' } : {}),
            }}
          >
            <DividendCard
              monthlyRevenue={item?.monthlyRevenue ?? 120_000_000}
              dividendRatio={item?.dividendRatio ?? 0.3}
              dividendPerShare={item?.dividendPerShare ?? 360}
              expectedAnnualYield={item?.expectedAnnualYield ?? expectedYield}
            />
            <DividendSimulatorV2
              sharePriceKrw={sharePriceKrw}
              dividendPerShare={dividendPerShare}
              expectedAnnualYield={expectedYield}
              monthlyRevenue={item?.monthlyRevenue ?? 120_000_000}
              dividendRatio={item?.dividendRatio ?? 0.3}
              totalShares={item?.total_shares ?? 100_000}
              loading={itemLoading}
              error={itemError ? '정보를 불러올 수 없습니다' : null}
              onInvestClick={(amt) => {
                setInvestAmount(amt);
                hasSession ? setShowConfirm(true) : (window.location.href = '/login');
              }}
            />
          </div>
        )}
      </div>

      {activeTab === 'invest' && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 border-t"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <div className="py-3" style={{ paddingLeft: 'var(--space-lg)', paddingRight: 'var(--space-lg)' }}>
            <p className="caption text-center mb-1 metric-number" style={{ color: 'var(--text-secondary)' }}>
              {participants}명 · 오늘 {todayCount}건
            </p>
            <p className="caption text-center mb-1" style={{ color: 'var(--text-muted)' }}>
              투자 후 매월 배당 · 원장 자동 기록
            </p>
            <p className="caption text-center mb-2" style={{ color: 'var(--text-secondary)' }}>{ctaSubtext}</p>
            <button
              type="button"
              onClick={() => (hasSession ? setShowConfirm(true) : (window.location.href = '/login'))}
              className={`w-full rounded-2xl py-4 body font-bold transition-opacity duration-200 hover:opacity-95 active:opacity-90 tabular-nums ${dday != null && dday <= 3 ? 'animate-pulse' : ''}`}
              style={{
                background: dday != null && dday <= 3 ? 'linear-gradient(135deg, var(--accent-loss), #7f1d1d)' : 'var(--royal-blue)',
                color: '#fff',
              }}
            >
              {ctaButtonText}
            </button>
          </div>
        </div>
      )}

      <Toast message={toastMessage} visible={toastVisible} onHide={() => setToastVisible(false)} />

      {showConfirm && (
        <InvestConfirmModal
          amount={investAmount}
          productTitle={title}
          onConfirm={handleInvestConfirm}
          onCancel={() => setShowConfirm(false)}
          loading={investLoading}
        />
      )}
    </div>
  );
}

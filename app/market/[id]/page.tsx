'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Moon, Sun, Share2, Check, Gift, MessageCircle, Award } from 'lucide-react';
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
import OrderBookRealtime from '@/components/market/OrderBookRealtime';
import PriceChartBlock from '@/components/market/PriceChartBlock';
import PriceHeader from '@/components/market/PriceHeader';
import TradeHistoryRealtime from '@/components/market/TradeHistoryRealtime';
import PositionPanel from '@/components/market/PositionPanel';
import TradingPanelV2 from '@/components/market/TradingPanelV2';
import MobileTradeTabBar, { type MobileTradeTab } from '@/components/market/MobileTradeTabBar';
import MobileBuySellBar from '@/components/market/MobileBuySellBar';
import MarketChatSection from '@/components/market/MarketChatSection';
import ArtistProgressCard from '@/components/profile/ArtistProgressCard';
import Skeleton from '@/components/ui/Skeleton';
import { CardV5 } from '@/components/ui/CardV5';
import MetricRow from '@/components/ui/MetricRow';
import Divider from '@/components/ui/Divider';
import TopAppBar from '@/components/ui/TopAppBar';
import { useAuth } from '@/components/auth/AuthProvider';

const YT_FALLBACK = 'HosW0gulISQ';
const YT_START_SEC = 25;
const DEFAULT_AMOUNT = 100_000;

type TabKey = 'info' | 'trade' | 'invest';
type TradeSubTab = 'orderbook' | 'trades';

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

function PriceHeaderSection({
  title,
  sharePriceKrw,
  changeRate,
  expectedYield,
  hasSession,
  onBuyClick,
  onSellClick,
}: {
  title: string;
  sharePriceKrw: number;
  changeRate: number | null;
  expectedYield: number;
  hasSession: boolean;
  onBuyClick: () => void;
  onSellClick: () => void;
}) {
  const monthlyYield = (expectedYield / 12).toFixed(2);
  const isUp = changeRate != null && changeRate > 0;
  const isDown = changeRate != null && changeRate < 0;

  return (
    <section className="px-4 py-4 md:py-6 bg-white border-b border-slate-200">
      <div className="mx-auto max-w-[1320px]">
        <h1 className="font-bold text-slate-900 mb-2" style={{ fontSize: 'clamp(24px, 5vw, 28px)' }}>
          {title}
        </h1>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-6">
          <div>
            <div className="font-bold text-slate-900 tabular-nums" style={{ fontSize: 'clamp(32px, 6vw, 40px)' }}>
              {formatKrw(sharePriceKrw)}
            </div>
            <div className="flex items-baseline gap-3 mt-1">
              {changeRate != null && changeRate !== 0 && (
                <span
                  className={`font-bold tabular-nums ${isUp ? 'text-red-600' : isDown ? 'text-blue-600' : 'text-slate-500'}`}
                  style={{ fontSize: 14 }}
                >
                  {isUp ? '▲' : '▼'} {isUp ? '+' : ''}{formatRate(changeRate)}
                </span>
              )}
              <span className="font-bold text-emerald-600" style={{ fontSize: 14 }}>
                월 예상 수익률 {monthlyYield}%
              </span>
            </div>
            <p className="text-slate-600 mt-0.5" style={{ fontSize: 12 }}>최근 3개월 연속 배당</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button
              type="button"
              onClick={onBuyClick}
              className="flex-1 md:flex-none md:min-w-[120px] h-12 md:h-14 rounded-xl font-bold text-white transition hover:opacity-90"
              style={{ backgroundColor: 'var(--royal-blue)', fontSize: 14 }}
            >
              매수
            </button>
            <button
              type="button"
              onClick={onSellClick}
              className="flex-1 md:flex-none md:min-w-[120px] h-12 md:h-14 rounded-xl font-bold border-2 transition hover:opacity-90"
              style={{
                borderColor: 'var(--royal-blue)',
                color: 'var(--royal-blue)',
                backgroundColor: 'transparent',
                fontSize: 14,
              }}
            >
              매도
            </button>
          </div>
        </div>
      </div>
    </section>
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
      <div className="absolute top-0 left-0 p-4 flex gap-2">
        {isPopular && (
          <span className="font-bold px-2 py-0.5 rounded-full text-white" style={{ fontSize: 12, backgroundColor: 'var(--emerald)' }}>
            인기
          </span>
        )}
        {deadlineSoon && (
          <span className="font-bold px-2 py-0.5 rounded-full text-white" style={{ fontSize: 12, backgroundColor: 'var(--accent-loss)' }}>
            마감임박
          </span>
        )}
      </div>
      <div
        className="absolute bottom-0 left-0 right-0 p-4 flex flex-col justify-end"
        style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}
      >
        <h2 className="font-bold text-white" style={{ fontSize: 'clamp(24px, 4vw, 28px)' }}>{title}</h2>
        <p className="mt-1 text-white/90" style={{ fontSize: 12 }}>{platform} · {category}</p>
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
  settlementCount,
  avgMonthlyDividend,
}: {
  currentPriceKrw: number;
  expectedYield: number;
  progress: number;
  participants: number;
  todayCount: number;
  settlementCount?: number;
  avgMonthlyDividend?: number | null;
}) {
  const extraMetrics = [
    { label: '누적 배당', value: '—' },
    { label: '정산', value: settlementCount != null ? `${settlementCount}건` : '—' },
    { label: '월배당', value: avgMonthlyDividend != null ? formatKrw(avgMonthlyDividend) : '—' },
  ];
  return (
    <CardV5 className="card-inner-gap">
      <div className="py-4">
        <div className="font-extrabold tabular-nums" style={{ color: 'var(--text)', fontSize: 'clamp(32px, 5vw, 40px)' }}>
          {formatKrw(currentPriceKrw)}
        </div>
        <p className="font-medium mt-0.5" style={{ color: 'var(--text-secondary)', fontSize: 12 }}>현재가</p>
      </div>
      <Divider />
      <div>
        <div className="font-bold tabular-nums" style={{ color: 'var(--emerald)', fontSize: 14 }}>
          {formatRate(expectedYield)}
        </div>
        <p className="font-medium mt-0.5" style={{ color: 'var(--text-secondary)', fontSize: 12 }}>예상 연수익률</p>
      </div>
      <MetricRow items={[{ label: '모집률', value: `${progress.toFixed(1)}%` }]} columns={2} dense compact valueClassName="font-semibold" />
      <div className="w-full rounded-full overflow-hidden h-1.5" style={{ backgroundColor: 'var(--border)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, progress)}%`, backgroundColor: 'var(--royal-blue)' }} />
      </div>
      <p className="font-medium tabular-nums mt-2" style={{ color: 'var(--text-muted)', fontSize: 12 }}>
        {participants}명 · 오늘 {todayCount}건
      </p>
      <MetricRow items={extraMetrics} columns={3} dense compact valueClassName="font-semibold" />
      <Divider />
      <div className="flex flex-wrap items-center gap-2 pt-2">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border font-medium" style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)', fontSize: 12 }}>
          <Check size={10} style={{ color: 'var(--emerald)' }} />
          원장 기록 기반
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border font-medium" style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)', fontSize: 12 }}>
          <span className="w-1 h-1 rounded-full bg-[var(--emerald)] animate-pulse" style={{ animationDuration: '1.5s' }} />
          실시간 체결
        </span>
        <Link href="/trust" className="font-medium underline" style={{ color: 'var(--royal-blue)', fontSize: 12 }}>정산 이력</Link>
      </div>
    </CardV5>
  );
}

function FanCommunitySection() {
  const items = [
    { icon: Gift, label: '레벨', desc: '팬 등급에 따라 리워드 혜택' },
    { icon: MessageCircle, label: '채팅', desc: '팬들과 실시간 소통' },
    { icon: Award, label: '굿즈', desc: '한정판 굿즈 구매 혜택' },
  ];
  return (
    <section className="px-4 py-10 md:py-12 bg-slate-50 border-t border-slate-200">
      <div className="mx-auto max-w-[1320px]">
        <h3 className="font-bold text-slate-900 mb-6" style={{ fontSize: 24 }}>
          팬 등급 & 커뮤니티
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <Icon size={24} className="text-slate-600" strokeWidth={2} />
              </div>
              <p className="font-bold text-slate-900 mb-2" style={{ fontSize: 14 }}>{label}</p>
              <p className="text-slate-600" style={{ fontSize: 12 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
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
    <nav className="sticky top-14 z-40 flex border-b" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => onTabChange(t.key)}
          disabled={t.key === 'trade' && !isTradable}
          className="flex-1 py-3 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            fontSize: 14,
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

function TradeSubTabNav({ active, onChange }: { active: TradeSubTab; onChange: (t: TradeSubTab) => void }) {
  return (
    <nav className="flex border-b" style={{ borderColor: 'var(--border)' }}>
      {(['orderbook', 'trades'] as const).map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className="flex-1 py-2.5 font-semibold transition"
          style={{
            fontSize: 13,
            color: active === t ? 'var(--royal-blue)' : 'var(--text-secondary)',
            borderBottom: active === t ? '2px solid var(--royal-blue)' : '2px solid transparent',
          }}
        >
          {t === 'orderbook' ? '호가' : '체결'}
        </button>
      ))}
    </nav>
  );
}

function ChartSkeleton() {
  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
      <div className="h-6 w-24 rounded bg-slate-200 animate-pulse mb-4" />
      <div className="h-[320px] rounded-lg bg-slate-100 animate-pulse" />
    </div>
  );
}

export default function MarketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [activeTab, setActiveTab] = useState<TabKey>('info');
  const [tradeSubTab, setTradeSubTab] = useState<TradeSubTab>('orderbook');
  const [mobileTradeTab, setMobileTradeTab] = useState<MobileTradeTab>('chart');
  const [showConfirm, setShowConfirm] = useState(false);
  const [investLoading, setInvestLoading] = useState(false);
  const [investAmount, setInvestAmount] = useState(DEFAULT_AMOUNT);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('투자 완료되었습니다.');
  const [todayCount, setTodayCount] = useState<number>(0);
  const [myOrderPrices, setMyOrderPrices] = useState<number[]>([]);
  const [lastTradePrice, setLastTradePrice] = useState<number | null>(null);
  const [prevTradePrice, setPrevTradePrice] = useState<number | null>(null);
  const orderPanelRef = React.useRef<HTMLDivElement>(null);

  const { user } = useAuth();
  const hasSession = !!user;
  const { item, loading: itemLoading, error: itemError, refetch: refetchItem } = useMarketItem(id);
  const { items: investLogs, refetch: refetchInvestLogs } = useRecentInvestLog(id);
  const { items: artistContributions, refetch: refetchContributions } = useArtistContribution(hasSession);
  const { items: artistProgress, refetch: refetchProgress } = useArtistProgress(hasSession);
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

  const handleTrade = useCallback((priceUsd: number) => {
    setLastTradePrice((prev) => {
      if (prev != null) setPrevTradePrice(prev);
      return priceUsd;
    });
  }, []);

  const fetchMyOrderbookOrders = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/orders/orderbook/my?item_id=${id}`, { cache: 'no-store' });
      const j = await (res.ok ? res.json() : null);
      const orders = j?.orders ?? [];
      setMyOrderPrices(orders.map((o: { price_usd?: number }) => Number(o.price_usd ?? 0)).filter((p: number) => p > 0));
    } catch {
      setMyOrderPrices([]);
    }
  }, [id, user]);

  useEffect(() => {
    fetchMyOrderbookOrders();
  }, [fetchMyOrderbookOrders]);

  useEffect(() => {
    const onRefresh = () => fetchMyOrderbookOrders();
    window.addEventListener('invest-success', onRefresh);
    window.addEventListener('wallet-refresh', onRefresh);
    return () => {
      window.removeEventListener('invest-success', onRefresh);
      window.removeEventListener('wallet-refresh', onRefresh);
    };
  }, [fetchMyOrderbookOrders]);

  const ytId = item?.youtube_video_id ?? YT_FALLBACK;
  const title = item?.title ?? '여행가 제이';
  const category = item?.category ?? '여행';
  const platform = item?.platform ?? '유튜브';
  const productType = item?.product_type ?? 'DIVIDEND_ONLY';
  const isTradable = productType === 'DIVIDEND_TRADABLE';
  const fxRate = item?.fx_rate ?? 1350;
  const targetAmount = item?.total_raise ?? 0;
  const currentAmount = item?.current_raise ?? 0;
  const progress = useMemo(() => calcProgress(targetAmount, currentAmount), [targetAmount, currentAmount]);
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

  const prevCloseUsd = sharePriceUsd != null ? sharePriceUsd * 0.98 : null;
  const changeRate = sharePriceUsd != null && prevCloseUsd != null && prevCloseUsd > 0
    ? ((sharePriceUsd - prevCloseUsd) / prevCloseUsd) * 100
    : null;

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

  const handleBuyClick = () => {
    if (hasSession) setShowConfirm(true);
    else window.location.href = '/login';
  };

  const handleSellClick = () => {
    setActiveTab('trade');
    setTimeout(() => orderPanelRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

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
      <div className="flex flex-col items-center justify-center p-6 min-h-screen" style={{ backgroundColor: 'var(--card)' }}>
        <DetailHeader onShare={handleShare} />
        <p className="mb-4 font-medium" style={{ color: 'var(--text-secondary)', fontSize: 14 }}>정보를 불러올 수 없습니다.</p>
        <button
          onClick={refetchItem}
          className="px-4 py-2 rounded-lg font-semibold text-white"
          style={{ backgroundColor: 'var(--royal-blue)', fontSize: 14 }}
        >
          다시 시도
        </button>
      </div>
    );
  }

  const sectionGap = 20;
  const sharePriceNum = sharePriceUsd ?? sharePriceKrw / fxRate;

  return (
    <div style={{ backgroundColor: 'var(--bg)' }}>
      <DetailHeader onShare={handleShare} />

      <div className="px-4 md:px-6">
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

      <PriceHeaderSection
        title={title}
        sharePriceKrw={sharePriceKrw}
        changeRate={changeRate}
        expectedYield={expectedYield}
        hasSession={hasSession}
        onBuyClick={handleBuyClick}
        onSellClick={handleSellClick}
      />

      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} isTradable={isTradable} />

      <div
        className={
          activeTab === 'trade' && isTradable ? 'pb-80' :
          activeTab === 'invest' ? 'pb-32' : 'pb-24'
        }
      >
        {activeTab === 'info' && (
          <div className="px-4 md:px-6 py-6 flex flex-col gap-6 max-w-[1320px] mx-auto">
            <SummaryFinancialCard
              currentPriceKrw={sharePriceKrw}
              expectedYield={expectedYield}
              progress={progress}
              participants={participants}
              todayCount={todayCount}
              settlementCount={item?.settlement_count}
              avgMonthlyDividend={dividendPerShare}
            />
            <CardV5 className="card-inner-gap">
              <p className="font-medium mb-3" style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Performance Snapshot</p>
              <MetricRow
                items={[
                  { label: '최근 30일 수익률', value: '—' },
                  { label: '최근 90일 수익률', value: '—' },
                  { label: '변동성 지수', value: '—' },
                ]}
                columns={3}
                dense
                valueClassName="font-semibold"
              />
            </CardV5>
            <CardV5 className="card-inner-gap">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {item?.integrity_ok && <span className="px-2 py-0.5 rounded-full text-white font-medium" style={{ backgroundColor: 'var(--emerald)', fontSize: 12 }}>원장</span>}
                <span className="px-2 py-0.5 rounded-full text-white font-medium" style={{ backgroundColor: 'var(--royal-blue)', fontSize: 12 }}>실시간</span>
                {(item?.settlement_count ?? 0) > 0 && <span className="px-2 py-0.5 rounded-full text-white font-medium" style={{ backgroundColor: 'var(--emerald)', fontSize: 12 }}>정산 {item?.settlement_count}건</span>}
              </div>
              <MetricRow
                items={[
                  { label: '현재가', value: formatKrw(sharePriceKrw) },
                  { label: '예상수익률', value: formatRate(expectedYield), tone: 'positive' },
                  { label: '참여자', value: `${participants}명` },
                ]}
                columns={3}
                dense
                valueClassName="font-semibold"
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
                remainingAmount={Math.max(0, targetAmount - currentAmount)}
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
              <div className="w-full py-2 px-4 flex items-center justify-center gap-4 font-medium rounded-xl" style={{ backgroundColor: 'var(--midnight-navy)', color: '#C5A059', fontSize: 13 }}>
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
              <p className="font-medium mb-2" style={{ color: 'var(--text-secondary)', fontSize: 12 }}>최근 체결 · 정산/원장 기반</p>
              <TrustBadges />
            </div>
            <RecentInvestLog items={investLogs} />
          </div>
        )}

        {activeTab === 'trade' && (
          <div className={!isTradable ? 'opacity-60' : ''}>
            {isTradable ? (
              <>
                {/* PC: 3컬럼 [차트 | 호가+체결 | 주문패널] */}
                <div className="hidden lg:block px-4 md:px-6 py-6">
                  <div className="mx-auto max-w-[1320px] grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6" style={{ gap: sectionGap }}>
                    {/* 좌: 차트 */}
                    <div className="lg:col-span-5">
                      <div className="rounded-xl p-4 h-full min-h-[400px]" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                        {itemLoading ? (
                          <ChartSkeleton />
                        ) : (
                          <>
                            <PriceHeader
                              sharePriceUsd={lastTradePrice ?? sharePriceNum}
                              fxRate={fxRate}
                              prevCloseUsd={prevTradePrice ?? sharePriceNum * 0.98}
                              volume24h={item?.last_24h_amount ?? null}
                              tradeCount24h={item?.last_24h_count ?? null}
                            />
                            <div className="min-h-[320px]">
                              <PriceChartBlock
                                sharePriceUsd={sharePriceNum}
                                totalRaiseUsd={totalRaiseUsd ?? null}
                                currentRaiseUsd={currentRaiseUsd ?? null}
                                fxRate={fxRate}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* 중: 호가 + 체결 */}
                    <div className="lg:col-span-4 flex flex-col gap-4" style={{ gap: sectionGap }}>
                      <div className="rounded-xl p-4 flex-1 min-h-[200px]" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                        <h3 className="font-bold mb-3 text-slate-900" style={{ fontSize: 14 }}>호가</h3>
                        <OrderBookRealtime
                          contentId={id}
                          currentPriceUsd={sharePriceNum}
                          myOrderPrices={myOrderPrices}
                          disabled={!isTradable}
                        />
                      </div>
                      <div className="rounded-xl p-4 flex-1 min-h-[200px]" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                        <h3 className="font-bold mb-3 text-slate-900" style={{ fontSize: 14 }}>체결내역</h3>
                        <TradeHistoryRealtime contentId={id} onTrade={handleTrade} disabled={!isTradable} />
                      </div>
                    </div>

                    {/* 우: 주문패널 (sticky) */}
                    <div className="lg:col-span-3">
                      <div
                        className="lg:sticky rounded-xl p-4 flex flex-col gap-4"
                        style={{
                          top: 80,
                          backgroundColor: 'var(--card)',
                          border: '1px solid var(--border)',
                          gap: sectionGap,
                        }}
                      >
                        <TradingPanelV2
                          contentId={id}
                          sharePriceUsd={sharePriceNum}
                          fxRate={fxRate}
                          isLoggedIn={hasSession}
                          totalSupplyShares={
                            sharePriceNum > 0 && item?.total_raise_usd != null
                              ? item.total_raise_usd / sharePriceNum
                              : null
                          }
                          onToast={(msg) => {
                            setToastMessage(msg);
                            setToastVisible(true);
                          }}
                          variant="order-only"
                          disabled={!isTradable}
                        />
                        <PositionPanel
                          assetId={id}
                          sharePriceUsd={sharePriceNum}
                          fxRate={fxRate}
                          isLoggedIn={hasSession}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 모바일: 토스증권 스타일 5탭 + 하단 고정 바 */}
                <div className="lg:hidden">
                  <MobileTradeTabBar activeTab={mobileTradeTab} onTabChange={setMobileTradeTab} />
                  <div className="px-4 py-4 pb-28">
                    {mobileTradeTab === 'chart' && (
                      <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                        {itemLoading ? (
                          <ChartSkeleton />
                        ) : (
                          <>
                            <PriceHeader
                              sharePriceUsd={lastTradePrice ?? sharePriceNum}
                              fxRate={fxRate}
                              prevCloseUsd={prevTradePrice ?? sharePriceNum * 0.98}
                              volume24h={item?.last_24h_amount ?? null}
                              tradeCount24h={item?.last_24h_count ?? null}
                            />
                            <div className="min-h-[240px]">
                              <PriceChartBlock
                                sharePriceUsd={sharePriceNum}
                                totalRaiseUsd={totalRaiseUsd ?? null}
                                currentRaiseUsd={currentRaiseUsd ?? null}
                                fxRate={fxRate}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    )}
                    {mobileTradeTab === 'orderbook' && (
                      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                        <TradeSubTabNav active={tradeSubTab} onChange={setTradeSubTab} />
                        <div className="p-4 min-h-[200px]">
                          {tradeSubTab === 'orderbook' ? (
                            <OrderBookRealtime
                              contentId={id}
                              currentPriceUsd={sharePriceNum}
                              myOrderPrices={myOrderPrices}
                              disabled={!isTradable}
                            />
                          ) : (
                            <TradeHistoryRealtime contentId={id} onTrade={handleTrade} disabled={!isTradable} />
                          )}
                        </div>
                      </div>
                    )}
                    {mobileTradeTab === 'position' && (
                      <div className="flex flex-col gap-4">
                        <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                          <PositionPanel
                            assetId={id}
                            sharePriceUsd={sharePriceNum}
                            fxRate={fxRate}
                            isLoggedIn={hasSession}
                          />
                        </div>
                        <div ref={orderPanelRef} className="rounded-2xl p-4" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                          <h3 className="font-bold mb-3" style={{ fontSize: 14, color: 'var(--text)' }}>내 주문</h3>
                          <TradingPanelV2
                            contentId={id}
                            sharePriceUsd={sharePriceNum}
                            fxRate={fxRate}
                            isLoggedIn={hasSession}
                            totalSupplyShares={
                              sharePriceNum > 0 && item?.total_raise_usd != null
                                ? item.total_raise_usd / sharePriceNum
                                : null
                            }
                            onToast={(msg) => {
                              setToastMessage(msg);
                              setToastVisible(true);
                            }}
                            variant="order-only"
                            disabled={!isTradable}
                          />
                        </div>
                      </div>
                    )}
                    {mobileTradeTab === 'info' && (
                      <div className="flex flex-col gap-4">
                        <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                          <DividendInfo
                            payoutDay={item?.payout_day ?? 3}
                            dividendMonthlyRate={item?.dividend_monthly_rate}
                            dividendMonthlyUsdPerShare={item?.dividend_monthly_usd_per_share}
                            sharePriceUsd={sharePriceUsd}
                            fxRate={fxRate}
                          />
                        </div>
                        {hasSession ? (
                          artistProgress.length > 0 || artistContributions.length > 0 ? (
                            <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                              <h3 className="font-bold mb-3" style={{ fontSize: 14, color: 'var(--text)' }}>내 아티스트 현황</h3>
                              <div className="flex flex-col gap-3">
                                {artistProgress.slice(0, 3).map((p) => (
                                  <ArtistProgressCard
                                    key={p.artist_keyword}
                                    artist={p.artist_keyword}
                                    totalAmount={p.total_amount}
                                    targetAmount={p.target_amount}
                                    progress={p.progress_percent}
                                    compact
                                  />
                                ))}
                                {artistProgress.length === 0 && artistContributions.length > 0 && (
                                  <p className="body-sm" style={{ color: 'var(--text-secondary)' }}>
                                    기여금 {formatKrw(artistContributions.find((c) => c.artist_keyword === item?.artist_keyword)?.total_amount ?? 0)}
                                  </p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="rounded-2xl p-4 text-center" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                              <p className="body-sm" style={{ color: 'var(--text-secondary)' }}>준비중</p>
                            </div>
                          )
                        ) : (
                          <div className="rounded-2xl p-4 text-center" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                            <p className="body-sm" style={{ color: 'var(--text-secondary)' }}>로그인 후 아티스트 현황을 확인하세요</p>
                          </div>
                        )}
                      </div>
                    )}
                    {mobileTradeTab === 'community' && (
                      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
                        <MarketChatSection marketId={id} />
                      </div>
                    )}
                  </div>
                  <MobileBuySellBar
                    onSellClick={() => {
                      setMobileTradeTab('position');
                      setTimeout(() => orderPanelRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
                    }}
                    onBuyClick={handleBuyClick}
                  />
                </div>
              </>
            ) : (
              <div className="px-4 py-12 max-w-[1320px] mx-auto">
                <CardV5 className="text-center p-8">
                  <p className="font-medium" style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                    현재는 거래가 준비 중이에요. 모집 완료 후 거래가 가능합니다.
                  </p>
                </CardV5>
              </div>
            )}
          </div>
        )}

        {activeTab === 'invest' && (
          <div className="px-4 md:px-6 py-6 flex flex-col gap-6 max-w-[1320px] mx-auto">
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

      <FanCommunitySection />

      {activeTab === 'invest' && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="py-3 px-4">
            <p className="text-center mb-1 tabular-nums font-medium" style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
              {participants}명 · 오늘 {todayCount}건
            </p>
            <p className="text-center mb-1 font-medium" style={{ color: 'var(--text-muted)', fontSize: 12 }}>
              투자 후 매월 배당 · 원장 자동 기록
            </p>
            <p className="text-center mb-2 font-medium" style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{ctaSubtext}</p>
            <button
              type="button"
              onClick={() => (hasSession ? setShowConfirm(true) : (window.location.href = '/login'))}
              className={`w-full rounded-2xl py-4 font-bold transition-opacity duration-200 hover:opacity-95 active:opacity-90 tabular-nums ${dday != null && dday <= 3 ? 'animate-pulse' : ''}`}
              style={{
                fontSize: 14,
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

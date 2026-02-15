'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Moon, Sun, Share2 } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import YouTubeEmbed from '@/components/common/YouTubeEmbed';
import MarketStatsBar from '@/components/market/MarketStatsBar';
import ExpectedReturnBox from '@/components/market/ExpectedReturnBox';
import TrustBadges from '@/components/market/TrustBadges';
import RecentInvestLog from '@/components/market/RecentInvestLog';
import InvestConfirmModal from '@/components/market/InvestConfirmModal';
import PriceHeader from '@/components/market/PriceHeader';
import PriceChartBlock from '@/components/market/PriceChartBlock';
import DividendInfo from '@/components/market/DividendInfo';
import TradingPanelV2 from '@/components/market/TradingPanelV2';
import Toast from '@/components/ui/Toast';
import { useMarketItem } from '@/hooks/useMarketItem';
import { useRecentInvestLog } from '@/hooks/useRecentInvestLog';
import { useArtistContribution } from '@/hooks/useArtistContribution';
import { useArtistProgress } from '@/hooks/useArtistProgress';
import { formatKrw, formatRate } from '@/lib/utils/format';
import DividendCard from '@/components/market/DividendCard';
import AngelStorySection from '@/components/market/AngelStorySection';
import DividendSimulator from '@/components/market/DividendSimulator';
import AngelPitchDeckSection from '@/components/market/AngelPitchDeckSection';
import DividendExplainSection from '@/components/market/DividendExplainSection';
import DividendSimulatorV2 from '@/components/market/DividendSimulatorV2';
import ExchangeSection from '@/components/market/ExchangeSection';
import Skeleton from '@/components/ui/Skeleton';
import { useAuth } from '@/components/auth/AuthProvider';

const YT_FALLBACK = 'HosW0gulISQ';
const YT_START_SEC = 25;
const DEFAULT_AMOUNT = 100_000;

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

function MarketHeader({ onShare }: { onShare?: () => void }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b bg-white" style={{ borderColor: 'var(--border)' }}>
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/market" className="text-sm font-medium text-[var(--text-secondary)]">
          ← 마켓으로
        </Link>
        <div className="flex items-center gap-1">
          {onShare && (
            <button
              type="button"
              onClick={onShare}
              className="p-2 rounded-lg transition hover:opacity-80 text-[var(--text-secondary)]"
              aria-label="공유"
            >
              <Share2 size={20} strokeWidth={2} />
            </button>
          )}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg transition hover:opacity-80 text-[var(--text-secondary)]"
            aria-label={theme === 'light' ? '다크 모드' : '라이트 모드'}
          >
            {theme === 'light' ? <Moon size={22} strokeWidth={2} /> : <Sun size={22} strokeWidth={2} />}
          </button>
        </div>
      </div>
    </header>
  );
}

export default function MarketDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const [showConfirm, setShowConfirm] = useState(false);
  const [investLoading, setInvestLoading] = useState(false);
  const [investAmount, setInvestAmount] = useState(DEFAULT_AMOUNT);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('투자 완료되었습니다.');
  const [todayCount, setTodayCount] = useState<number>(0);

  const { user } = useAuth();
  const { item, loading: itemLoading, error: itemError, refetch: refetchItem } = useMarketItem(id);
  const { items: investLogs, refetch: refetchInvestLogs } = useRecentInvestLog(id);
  const { items: artistContributions, refetch: refetchContributions } = useArtistContribution(false);
  const { items: artistProgress, refetch: refetchProgress } = useArtistProgress(false);
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
      ? `D-${dday} 공연 전 엔젤로 참여하기`
      : isTradable
        ? `${formatKrw(investAmount)} 엔젤 참여/매수`
        : `${formatKrw(investAmount)} 엔젤로 참여하기`;

  if (!itemLoading && itemError && !item) {
    return (
      <main className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <MarketHeader onShare={handleShare} />
        <p className="text-[14px] text-gray-500 mb-4">정보를 불러올 수 없습니다.</p>
        <button onClick={refetchItem} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-[14px] font-semibold">
          다시 시도
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <MarketHeader onShare={handleShare} />

      <div className={`max-w-3xl mx-auto px-4 pt-6 ${isTradable ? 'pb-80' : 'pb-32'}`}>
        {/* 1. Hero Section */}
        <section className="relative w-full aspect-video rounded-[16px] overflow-hidden mb-6">
          {itemLoading ? <Skeleton className="w-full h-full" /> : (
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
          <div className="absolute top-2 left-2 flex gap-2">
            {isPopular && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white">인기</span>
            )}
            {deadlineSoon && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">마감임박</span>
            )}
          </div>
        </section>

        <section className="mb-6">
          <h1 className="text-[28px] font-extrabold leading-snug tracking-tight">{title}</h1>
          <p className="text-[13px] mt-1" style={{ color: 'var(--text-secondary)' }}>{creator} · {category}</p>
          <div className="flex gap-2 mt-2">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--primary)', color: '#fff' }}>
              {isTradable ? '월배당+거래' : '월배당'}
            </span>
            <span className="text-[12px] px-2 py-0.5 rounded bg-[var(--royal-blue)] text-white">{platform}</span>
          </div>
          <div className="mt-4 p-4 rounded-[16px]" style={{ backgroundColor: 'var(--royal-blue)', color: '#fff' }}>
            <div className="text-[12px] font-medium opacity-90">예상 배당 수익률</div>
            <div className="text-[28px] font-extrabold tabular-nums metric-xl mt-1">
              {formatRate(expectedYield)}
            </div>
          </div>
        </section>

        {/* 2. 배당 카드 */}
        <div className="mt-6">
          <DividendCard
            monthlyRevenue={item?.monthlyRevenue ?? 120_000_000}
            dividendRatio={item?.dividendRatio ?? 0.3}
            dividendPerShare={item?.dividendPerShare ?? 360}
            expectedAnnualYield={item?.expectedAnnualYield ?? expectedYield}
          />
        </div>

        {/* 3. 엔젤 설득 섹션 */}
        <div className="mt-6">
          <AngelStorySection
            creatorStory={item?.creator_story}
            growthReason1={item?.growth_reason_1}
            growthReason2={item?.growth_reason_2}
            growthReason3={item?.growth_reason_3}
          />
        </div>

        {/* 4. 수익률 시뮬레이터 V2 */}
        <div className="mt-6">
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

        {/* 4b. 엔젤 피치덱 + 배당 설명 */}
        <div className="mt-10">
          <AngelPitchDeckSection
            creatorStory={item?.creator_story ?? undefined}
            growthReason1={item?.growth_reason_1 ?? undefined}
            growthReason2={item?.growth_reason_2 ?? undefined}
            growthReason3={item?.growth_reason_3 ?? undefined}
          />
        </div>
        <div className="mt-6">
          <DividendExplainSection creatorStory={item?.creator_story ?? undefined} />
        </div>

        {/* 5. PriceHeader (USD + 로컬 + 전일대비 + 거래량) - 거래 불가 시에만 */}
        {hasUsdData && sharePriceUsd != null && !isTradable && (
          <div className="mt-10">
            <PriceHeader
              sharePriceUsd={sharePriceUsd}
              fxRate={fxRate}
              prevCloseUsd={sharePriceUsd * 0.98}
              volume24h={(item?.last_24h_amount ?? 0) || null}
            />
          </div>
        )}

        {/* 6. 차트 블록 (거래 불가 시에만, 거래 가능 시 ExchangeSection에 포함) */}
        {hasUsdData && !isTradable && (
          <div className="mt-10">
            <PriceChartBlock
              sharePriceUsd={sharePriceUsd}
              totalRaiseUsd={totalRaiseUsd}
              currentRaiseUsd={currentRaiseUsd}
              fxRate={fxRate}
            />
          </div>
        )}

        {/* 7. MarketStatsBar (USD 미사용 시 KRW 기반) */}
        {!hasUsdData && (
          <div className="mt-10">
            <MarketStatsBar
              progress={progress}
              targetAmount={targetAmount}
              currentAmount={currentAmount}
              participants={participants}
              remainingAmount={remainingAmount}
              isLive
              isDeadlineSoon={deadlineSoon}
            />
          </div>
        )}

        {/* 8. 거래소 UI (DIVIDEND_TRADABLE) / 거래 불가 (DIVIDEND_ONLY) */}
        {isTradable && sharePriceUsd != null ? (
          <div className="mt-10">
            <ExchangeSection
              contentId={id}
              sharePriceUsd={sharePriceUsd}
              fxRate={fxRate}
              isLoggedIn={hasSession}
              userId={user?.id}
              totalSupplyShares={
                sharePriceUsd != null && sharePriceUsd > 0 && item?.total_raise_usd != null
                  ? item.total_raise_usd / sharePriceUsd
                  : null
              }
              totalRaiseUsd={item?.total_raise_usd}
              currentRaiseUsd={item?.current_raise_usd}
              onToast={(msg) => {
                setToastMessage(msg);
                setToastVisible(true);
              }}
            />
          </div>
        ) : (
          <div className="mt-10">
            <p className="text-[12px] mb-3" style={{ color: 'var(--upbit-text-dim)' }}>거래 불가 · 엔젤 참여 후 월배당만 수령</p>
          </div>
        )}

        {/* 9. DividendInfo */}
        <div className="mt-10">
          <DividendInfo
            payoutDay={item?.payout_day ?? 3}
            dividendMonthlyRate={item?.dividend_monthly_rate}
            dividendMonthlyUsdPerShare={item?.dividend_monthly_usd_per_share}
            sharePriceUsd={sharePriceUsd}
            fxRate={fxRate}
          />
        </div>

        {/* 10. LiveMomentumBar */}
        {((item?.last_1h_count ?? 0) > 0 || (item?.last_24h_amount ?? 0) > 0) && (
          <div
            className="mt-10 w-full py-2 px-4 flex items-center justify-center gap-4 text-[12px] font-medium rounded-2xl"
            style={{ backgroundColor: '#000', color: '#C5A059' }}
          >
            <span className="inline-flex items-center gap-1.5 tabular-nums font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-pulse" />
              1h {(item?.last_1h_count ?? 0)}명
            </span>
            <span className="opacity-70">|</span>
            <span className="tabular-nums font-bold">24h {formatKrw(item?.last_24h_amount ?? 0)}</span>
          </div>
        )}

        {/* 11. ExpectedReturnBox */}
        <div className="mt-10">
          <ExpectedReturnBox yieldRate={yieldRate} defaultAmount={DEFAULT_AMOUNT} onAmountChange={setInvestAmount} />
        </div>

        {/* 12. TrustBadges */}
        <div className="mt-10">
          <p className="text-[11px] mb-2" style={{ color: 'var(--text-secondary)' }}>최근 체결 · 정산/원장 기반</p>
          <TrustBadges />
        </div>

        {/* 13. RecentInvestLog */}
        <div className="mt-10">
          <RecentInvestLog items={investLogs} />
        </div>
      </div>

      {/* Sticky CTA (거래 가능 시 주문 폼이 하단 고정되므로 CTA 숨김) */}
      {!isTradable && (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t md:hidden" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-3xl mx-auto px-4 py-3">
          <p className="text-[11px] text-center mb-1" style={{ color: 'var(--text-secondary)' }}>
            현재 {participants}명 참여 · 오늘 확정 {todayCount}건
          </p>
          <p className="text-[11px] text-center mb-2" style={{ color: 'var(--text-secondary)' }}>{ctaSubtext}</p>
          <button
            type="button"
            onClick={() => (hasSession ? setShowConfirm(true) : (window.location.href = '/login'))}
            className={`w-full rounded-2xl py-4 text-[16px] font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] tabular-nums ${dday != null && dday <= 3 ? 'animate-pulse' : ''}`}
            style={{
              background: dday != null && dday <= 3 ? 'linear-gradient(135deg,#dc2626,#7f1d1d)' : 'var(--upbit-bid)',
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
    </main>
  );
}

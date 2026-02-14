'use client';

import { use, useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Moon, Sun, Heart } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useToken } from '@/context/TokenContext';
import { useAuth } from '@/components/auth/AuthProvider';
import YouTubeEmbed from '@/components/common/YouTubeEmbed';
import MarketStatsBar from '@/components/market/MarketStatsBar';
import ExpectedReturnBox from '@/components/market/ExpectedReturnBox';
import TrustBadges from '@/components/market/TrustBadges';
import RecentInvestLog from '@/components/market/RecentInvestLog';
import InvestConfirmModal from '@/components/market/InvestConfirmModal';
import ProductChat from '@/components/chat/ProductChat';
import Toast from '@/components/ui/Toast';
import { useMarketItem } from '@/hooks/useMarketItem';
import { useRecentInvestLog } from '@/hooks/useRecentInvestLog';
import { useInterestToggle } from '@/hooks/useInterestToggle';
import { useMyInterests } from '@/hooks/useMyInterests';
import { useArtistContribution } from '@/hooks/useArtistContribution';
import { useArtistProgress } from '@/hooks/useArtistProgress';
import ArtistBadge from '@/components/profile/ArtistBadge';
import ArtistProgressCard from '@/components/profile/ArtistProgressCard';

const YT_FALLBACK = 'HosW0gulISQ';
const YT_START_SEC = 25;
const DEFAULT_AMOUNT = 100_000;

/** progress = current_raise / total_raise (실제 DB값 기반) */
function calcProgress(total?: number | null, current?: number | null): number {
  if (total != null && total > 0 && current != null) {
    return Math.min(100, Math.round((current / total) * 100));
  }
  return 0;
}

/** deadline 3일 이내 여부 */
function isDeadlineSoon(deadline: string | null | undefined): boolean {
  if (!deadline) return false;
  const d = new Date(deadline);
  const now = new Date();
  const diffDays = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 3;
}

function MarketHeader() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b" style={{ backgroundColor: 'var(--upbit-bg)', borderColor: 'var(--upbit-border)' }}>
      <div className="px-4 py-3 flex items-center justify-between">
        <Link href="/market" className="text-sm font-medium" style={{ color: 'var(--upbit-text-dim)' }}>
          ← 마켓으로
        </Link>
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-lg transition hover:opacity-80"
          style={{ backgroundColor: 'var(--upbit-panel)', color: 'var(--upbit-text-dim)' }}
          aria-label={theme === 'light' ? '다크 모드' : '라이트 모드'}
        >
          {theme === 'light' ? <Moon size={22} strokeWidth={2} /> : <Sun size={22} strokeWidth={2} />}
        </button>
      </div>
    </header>
  );
}

export default function MarketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const { formatPrice } = useToken();
  const [showConfirm, setShowConfirm] = useState(false);
  const [investLoading, setInvestLoading] = useState(false);
  const [investAmount, setInvestAmount] = useState(DEFAULT_AMOUNT);
  const [toastVisible, setToastVisible] = useState(false);

  const { item, loading: itemLoading, refetch: refetchItem } = useMarketItem(id);
  const { items: investLogs, refetch: refetchInvestLogs } = useRecentInvestLog(id);
  const { items: myInterests } = useMyInterests(!!user);
  const { items: artistContributions, refetch: refetchContributions } = useArtistContribution(!!user);
  const { items: artistProgress, refetch: refetchProgress } = useArtistProgress(!!user);
  const searchParams = useSearchParams();

  // 결제 플로우 리다이렉트 시 invest=done → invest-success 이벤트로 갱신
  useEffect(() => {
    if (searchParams.get('invest') === 'done') {
      refetchItem();
      refetchInvestLogs();
      refetchContributions();
      refetchProgress();
      window.dispatchEvent(new Event('invest-success'));
    }
  }, [searchParams, refetchItem, refetchInvestLogs, refetchContributions, refetchProgress]);
  const isInMyInterests = myInterests.some((i) => i.id === id);
  const { isInterested, toggle, loading: toggleLoading } = useInterestToggle(id, isInMyInterests);

  const hasSession = !!user;
  const ytId = item?.youtube_video_id ?? YT_FALLBACK;
  const title = item?.title ?? '여행가 제이';
  const creator = item?.creator_name ?? '크리에이터';
  const category = item?.category ?? '여행';
  const platform = item?.platform ?? '유튜브';

  const targetAmount = item?.total_raise ?? 0;
  const currentAmount = item?.current_raise ?? 0;
  const progress = useMemo(() => calcProgress(targetAmount, currentAmount), [targetAmount, currentAmount]);
  const remainingAmount = Math.max(0, targetAmount - currentAmount);
  const participants = item?.participants ?? Math.max(1, Math.floor(currentAmount / 300_000));
  const isPopular = (item?.popular_cnt ?? 0) >= 20;
  const deadlineSoon = isDeadlineSoon(item?.deadline ?? null);
  const yieldRate = item?.yield_rate ?? 8.4;
  const dday = useMemo(() => {
    const ed = item?.event_date;
    if (!ed) return null;
    const d = new Date(ed);
    const now = new Date();
    const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? diff : null;
  }, [item?.event_date]);

  const handleInvestConfirm = async () => {
    if (!hasSession) return;
    setInvestLoading(true);
    try {
      const res = await fetch('/api/orders/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: id, amount: investAmount }),
      });
      const json = await res.json();
      if (json?.success) {
        setShowConfirm(false);
        setToastVisible(true);
        refetchItem();
        refetchInvestLogs();
        refetchContributions();
        window.dispatchEvent(new Event('invest-success'));
      } else {
        alert(json?.error === 'INSUFFICIENT_FUNDS' ? '잔액 부족' : '투자 실패');
      }
    } catch {
      alert('투자 실패');
    } finally {
      setInvestLoading(false);
    }
  };

  return (
    <main className="min-h-screen pb-24 md:pb-6" style={{ backgroundColor: 'var(--upbit-bg)' }}>
      <MarketHeader />

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        {/* 1. 썸네일(영상) */}
        <section className="relative w-full aspect-video rounded-xl overflow-hidden border" style={{ borderColor: 'var(--upbit-border)' }}>
          {!itemLoading && (
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
          {/* 배지: 인기, 마감임박 */}
          <div className="absolute top-2 left-2 flex gap-2">
            {isPopular && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white">인기</span>
            )}
            {deadlineSoon && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">마감임박</span>
            )}
          </div>
        </section>

        {/* 2. 타이틀 + 3. 크리에이터 */}
        <section className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h1 className="text-[20px] font-bold" style={{ color: 'var(--upbit-text)' }}>{title}</h1>
            <p className="text-[14px] mt-1" style={{ color: 'var(--upbit-text-dim)' }}>{creator} · {category}</p>
            {item?.artist_keyword && user && (() => {
              const contrib = artistContributions.find((c) => c.artist_keyword === item.artist_keyword);
              const prog = artistProgress.find((p) => p.artist_keyword === item.artist_keyword);
              return (
                <div className="mt-2 space-y-2">
                  {contrib && <ArtistBadge artist={item.artist_keyword} amount={contrib.total_amount} />}
                  {prog && (
                    <ArtistProgressCard
                      artist={item.artist_keyword}
                      totalAmount={prog.total_amount}
                      targetAmount={prog.target_amount}
                      progress={prog.progress_percent}
                      compact
                    />
                  )}
                </div>
              );
            })()}
          </div>
          {user && (
            <button
              type="button"
              onClick={toggle}
              disabled={toggleLoading}
              className="p-2 rounded-full border shrink-0 disabled:opacity-50"
              style={{ borderColor: 'var(--upbit-border)' }}
              aria-label={isInterested ? '관심 해제' : '관심 등록'}
            >
              <Heart size={22} className={isInterested ? 'fill-red-500 text-red-500' : ''} strokeWidth={2} />
            </button>
          )}
        </section>

        <div className="flex gap-2">
          <span className="text-[12px] px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--upbit-bid)', color: '#fff' }}>{platform}</span>
          <span className="text-[12px] px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--upbit-panel)', color: 'var(--upbit-text-dim)', border: '1px solid var(--upbit-border)' }}>수익권</span>
        </div>

        {/* 3. MarketStatsBar */}
        <MarketStatsBar
          progress={progress}
          targetAmount={targetAmount}
          currentAmount={currentAmount}
          participants={participants}
          remainingAmount={remainingAmount}
          isLive
          isDeadlineSoon={deadlineSoon}
        />

        {/* 4. LiveMomentumBar (1h/24h) */}
        {((item?.last_1h_count ?? 0) > 0 || (item?.last_24h_amount ?? 0) > 0) && (
          <div
            className="w-full py-2 px-4 flex items-center justify-center gap-4 text-[12px] font-medium rounded-xl"
            style={{ backgroundColor: '#000', color: '#C5A059' }}
          >
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-pulse" />
              1h {(item?.last_1h_count ?? 0)}명
            </span>
            <span className="opacity-70">|</span>
            <span>24h ₩{(item?.last_24h_amount ?? 0).toLocaleString()}</span>
          </div>
        )}

        {/* 5. ExpectedReturnBox */}
        <ExpectedReturnBox yieldRate={yieldRate} defaultAmount={DEFAULT_AMOUNT} onAmountChange={setInvestAmount} />

        {/* 6. TrustBadges */}
        <TrustBadges />

        {/* 7. RecentInvestLog */}
        <RecentInvestLog items={investLogs} />

        {/* 8. ProductChat */}
        <div className="pb-4">
          <ProductChat productId={id} />
        </div>
      </div>

      {/* 9. Sticky Invest CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden p-4 border-t" style={{ backgroundColor: 'var(--upbit-panel)', borderColor: 'var(--upbit-border)' }}>
        <p className="text-[11px] text-center mb-2" style={{ color: 'var(--upbit-text-dim)' }}>
          {(item?.last_1h_count ?? 0) >= 5
            ? '최근 1시간 집중 참여 중'
            : dday != null && dday <= 3
              ? '공연 전 마지막 파트너십 기회'
              : '지금 참여하면 오늘 집계에 반영됩니다'}
        </p>
        <button
          type="button"
          onClick={() => (hasSession ? setShowConfirm(true) : (window.location.href = '/login'))}
          className={`w-full py-4 rounded-xl text-[16px] font-bold ${dday != null && dday <= 3 ? 'animate-pulse' : ''}`}
          style={{
            background: dday != null && dday <= 3 ? 'linear-gradient(135deg,#dc2626,#7f1d1d)' : 'var(--upbit-bid)',
            color: '#fff',
          }}
        >
          {dday != null && dday <= 3
            ? `D-${dday} 공연 전 파트너십 참여하기`
            : `${formatPrice(investAmount)} 투자하기`}
        </button>
      </div>

      <Toast message="투자 완료되었습니다." visible={toastVisible} onHide={() => setToastVisible(false)} />

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

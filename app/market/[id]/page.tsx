'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useToken } from '@/context/TokenContext';
import { useAuth } from '@/components/auth/AuthProvider';
import YouTubeEmbed from '@/components/common/YouTubeEmbed';
import PriceChartSection from '@/components/market/PriceChartSection';
import OrderBookPanel from '@/components/market/OrderBookPanel';
import TradingPanel from '@/components/market/TradingPanel';
import MobilizationInfo from '@/components/market/MobilizationInfo';
import RevenueInfoSection from '@/components/market/RevenueInfoSection';
import MarketChatSection from '@/components/market/MarketChatSection';
import { triggerMobilization90 } from '@/lib/notifications/triggers';

const YT_VIDEO_ID = 'HosW0gulISQ';
const YT_START_SEC = 25;

function MarketHeader() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b" style={{ backgroundColor: 'var(--upbit-bg)', borderColor: 'var(--upbit-border)' }}>
      <div className="px-4 py-3 flex items-center justify-between">
        <Link href="/market" className="text-sm" style={{ color: 'var(--upbit-text-dim)' }}>‹ 뒤로</Link>
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
  const router = useRouter();
  const { user, loading } = useAuth();
  const { formatPrice } = useToken();
  const [isMobilization, setIsMobilization] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);

  const hasSession = !!user;
  const price = 12300;
  const change = 3.2;

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const apply = () => setIsDesktop(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  const mobilizationData = {
    progress: 72,
    participants: 124,
    remainingText: 'D-12',
    targetAmount: 50000000,
    currentAmount: 36000000,
  };

  // 마감 90% 도달 시 알림 트리거
  useEffect(() => {
    if (isMobilization && mobilizationData.progress >= 90) {
      triggerMobilization90(id, mobilizationData.progress);
    }
  }, [id, isMobilization, mobilizationData.progress]);

  // 가격 변동 트리거 placeholder (실제 가격 fetch 시 연동)
  // import { triggerPriceChange } from '@/lib/notifications/triggers';
  // triggerPriceChange(contentId, prevPrice, newPrice);

  return (
    <main className="min-h-screen pb-32 md:pb-6" style={{ backgroundColor: 'var(--upbit-bg)' }}>
      <MarketHeader />

      <div className="md:flex md:gap-6 md:max-w-6xl md:mx-auto md:px-4">
        {/* 좌측: 정보 영역 */}
        <div className="flex-1 min-w-0">
          {/* 상단: 썸네일/영상 + 작품명 + 크리에이터 + 카테고리 + 가격 */}
          <section className="px-4 pt-4">
            <div className="relative w-full aspect-video rounded-xl overflow-hidden border" style={{ borderColor: 'var(--upbit-border)' }}>
              <YouTubeEmbed
                videoId={YT_VIDEO_ID}
                className="!rounded-none h-full w-full"
                title="작품 미리보기"
                autoplay
                mute
                controls
                loop={false}
                start={YT_START_SEC}
                fill
              />
            </div>
            <h1 className="text-[20px] font-bold mt-4" style={{ color: 'var(--upbit-text)' }}>여행가 제이</h1>
            <p className="text-[14px] mt-1" style={{ color: 'var(--upbit-text-dim)' }}>크리에이터 · 여행</p>
            <div className="flex gap-2 mt-2">
              <span className="text-[12px] px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--upbit-bid)', color: '#fff' }}>유튜브</span>
              <span className="text-[12px] px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--upbit-panel)', color: 'var(--upbit-text-dim)' }}>수익권</span>
            </div>
            <div className="mt-4 flex items-baseline gap-3 flex-wrap">
              <span className="text-[24px] font-bold tabular-nums" style={{ color: 'var(--upbit-text)' }}>{formatPrice(price)}</span>
              <span className="text-[14px] font-semibold tabular-nums" style={{ color: change >= 0 ? 'var(--upbit-positive)' : 'var(--upbit-ask)' }}>
                {change >= 0 ? '+' : ''}{change}%
              </span>
              <span className="text-[12px]" style={{ color: 'var(--upbit-text-dim)' }}>모집가</span>
            </div>
          </section>

          {/* 중단 좌측: 모집 정보 (청약형) 또는 그래프+호가 (2차거래형) */}
          <div className="px-4 mt-4 space-y-4">
            {isMobilization ? (
              <MobilizationInfo
                progress={mobilizationData.progress}
                participants={mobilizationData.participants}
                remainingText={mobilizationData.remainingText}
                targetAmount={mobilizationData.targetAmount}
                currentAmount={mobilizationData.currentAmount}
              />
            ) : null}

            <PriceChartSection mode="청약" isMobilization={isMobilization} />

            {!isMobilization && <OrderBookPanel />}

            <RevenueInfoSection />
          </div>

          {/* 채팅 하단 배치 - 채팅 답변 시 알림: handleSend 내부에서 notifyChatReply(원작성자_id, message_id, id) 호출 */}
          <div className="px-4 mt-6 mb-4">
            <MarketChatSection marketId={id} />
          </div>
        </div>

        {/* 데스크탑: 우측 고정 패널 */}
        {isDesktop && (
          <div className="hidden md:block w-[320px] shrink-0">
            <div className="sticky top-20">
              <TradingPanel
                mode="청약"
                price={price}
                productId={id}
                isLoggedIn={hasSession}
                isMobilization={isMobilization}
                sticky={false}
              />
            </div>
          </div>
        )}
      </div>

      {/* 모바일: 하단 고정 CTA */}
      {!isDesktop && (
        <div className="md:hidden">
          <TradingPanel
            mode="청약"
            price={price}
            productId={id}
            isLoggedIn={hasSession}
            isMobilization={isMobilization}
            sticky
          />
        </div>
      )}
    </main>
  );
}

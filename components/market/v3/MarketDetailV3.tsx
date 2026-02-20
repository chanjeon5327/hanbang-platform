'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import MarketDetailHeaderV3 from './MarketDetailHeaderV3';
import MarketDetailTabsV3, { type TabKey } from './MarketDetailTabsV3';
import MarketDetailCTAV3 from './MarketDetailCTAV3';
import ThemeToggleV3 from './ThemeToggleV3';
import Toast from '@/components/ui/Toast';
import { v3 } from '@/lib/design/tokens';
import { useDataTheme } from '@/context/DataThemeContext';
import { useMarketItem } from '@/hooks/useMarketItem';
import { useAuth } from '@/components/auth/AuthProvider';
import { useKycStatus } from '@/hooks/useKycStatus';

type Props = {
  marketId: string;
};

export default function MarketDetailV3({ marketId }: Props) {
  const { theme } = useDataTheme();
  const isApple = theme === 'apple';
  const [activeTab, setActiveTab] = useState<TabKey>('subscription');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const { user } = useAuth();
  const hasSession = !!user;
  const { isApproved } = useKycStatus();
  const router = useRouter();
  const { item, loading, error, refetch } = useMarketItem(marketId);

  const title = item?.title ?? '—';
  const symbol = item?.artist_keyword ?? item?.platform ?? undefined;
  const fxRate = item?.fx_rate ?? 1350;
  const sharePriceUsd = item?.share_price_usd ?? 10;
  const sharePriceKrw = sharePriceUsd * fxRate;
  const prevCloseUsd = sharePriceUsd * 0.98;
  const changeRate =
    ((sharePriceUsd - prevCloseUsd) / prevCloseUsd) * 100;
  const changeAmountKrw = (sharePriceUsd - prevCloseUsd) * fxRate;

  const handleShare = useCallback(async () => {
    const showCopied = () => {
      setToastMessage('주소가 복사되었습니다.');
      setToastVisible(true);
    };
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: document.title, url: window.location.href });
        showCopied();
      } else {
        await navigator.clipboard.writeText(window.location.href);
        showCopied();
      }
    } catch {
      try {
        await navigator.clipboard.writeText(window.location.href);
        showCopied();
      } catch {
        setToastMessage('복사에 실패했습니다.');
        setToastVisible(true);
      }
    }
  }, []);

  const handleBuyClick = useCallback(() => {
    if (!hasSession) {
      window.location.href = '/login';
      return;
    }
    if (!isApproved) {
      setToastMessage('KYC 인증이 필요합니다. KYC 페이지로 이동합니다.');
      setToastVisible(true);
      setTimeout(() => router.push('/kyc'), 500);
      return;
    }
    setToastMessage('매수 기능 준비 중입니다.');
    setToastVisible(true);
  }, [hasSession, isApproved, router]);

  const handleSellClick = useCallback(() => {
    if (!hasSession) {
      window.location.href = '/login';
      return;
    }
    if (!isApproved) {
      setToastMessage('KYC 인증이 필요합니다. KYC 페이지로 이동합니다.');
      setToastVisible(true);
      setTimeout(() => router.push('/kyc'), 500);
      return;
    }
    setToastMessage('매도 기능 준비 중입니다.');
    setToastVisible(true);
  }, [hasSession, isApproved, router]);

  if (error && !item) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[60vh] px-6"
        style={{ backgroundColor: 'var(--bg)' }}
      >
        <p className="mb-4" style={{ fontSize: 16, color: 'var(--text-secondary)' }}>
          정보를 불러올 수 없습니다.
        </p>
        <button
          onClick={() => refetch()}
          className="px-6 py-3 rounded-2xl font-semibold text-white"
          style={{ backgroundColor: 'var(--royal-blue)' }}
        >
          다시 시도
        </button>
      </div>
    );
  }

  const sectionGap = isApple ? 16 : 24;

  return (
    <div className="market-detail-v3" style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      <div
        className="market-detail-section flex justify-end px-4 pt-3 pb-1"
        style={{ paddingLeft: v3.padding.md, paddingRight: v3.padding.md, marginBottom: sectionGap }}
      >
        <ThemeToggleV3 />
      </div>
      <div className="market-detail-section" style={{ marginBottom: sectionGap }}>
      <MarketDetailHeaderV3
        marketId={marketId}
        title={title}
        symbol={symbol}
        backHref="/market"
        thumbnailUrl={item?.thumbnail_url}
        youtubeId={item?.youtube_video_id}
        priceKrw={sharePriceKrw}
        changeRate={changeRate}
        changeAmountKrw={changeAmountKrw}
        loading={loading}
        onShare={handleShare}
      />
      </div>
      <div className="market-detail-section">
      <MarketDetailTabsV3 activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <MarketDetailCTAV3
        onBuyClick={handleBuyClick}
        onSellClick={handleSellClick}
      />

      <Toast message={toastMessage} visible={toastVisible} onHide={() => setToastVisible(false)} />
    </div>
  );
}

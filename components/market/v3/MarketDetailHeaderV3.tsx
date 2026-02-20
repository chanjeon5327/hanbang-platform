'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useDataTheme } from '@/context/DataThemeContext';
import { ChevronLeft, Star, Bell, Share2 } from 'lucide-react';
import { formatKrw, formatRate } from '@/lib/utils/format';
import { v3 } from '@/lib/design/tokens';

const FAVORITES_KEY = 'hanbang_favorites';

type Props = {
  marketId: string;
  title: string;
  symbol?: string;
  backHref?: string;
  thumbnailUrl?: string | null;
  youtubeId?: string | null;
  priceKrw: number;
  changeRate?: number | null;
  changeAmountKrw?: number | null;
  loading?: boolean;
  onShare?: () => void;
  miniChartSlot?: React.ReactNode;
};

function useFavorite(marketId: string) {
  const [isFavorite, setIsFavorite] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      const list: string[] = raw ? JSON.parse(raw) : [];
      setIsFavorite(list.includes(marketId));
    } catch {
      setIsFavorite(false);
    }
  }, [marketId]);
  const toggle = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      const list: string[] = raw ? JSON.parse(raw) : [];
      const next = list.includes(marketId)
        ? list.filter((id) => id !== marketId)
        : [...list, marketId];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      setIsFavorite(next.includes(marketId));
    } catch {
      // noop
    }
  }, [marketId]);
  return { isFavorite, toggle };
}

function useShare(onShare?: () => void) {
  return useCallback(async () => {
    if (onShare) {
      onShare();
      return;
    }
    if (typeof window === 'undefined') return;
    try {
      if (navigator.share) {
        await navigator.share({ title: document.title, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
      }
    } catch {
      try {
        await navigator.clipboard.writeText(window.location.href);
      } catch {
        // noop
      }
    }
  }, [onShare]);
}

const iconBtnClass =
  'flex items-center justify-center min-w-[44px] min-h-[44px] rounded-xl transition hover:opacity-80';

export default function MarketDetailHeaderV3({
  marketId,
  title,
  symbol,
  backHref = '/market',
  thumbnailUrl,
  youtubeId,
  priceKrw,
  changeRate,
  changeAmountKrw,
  loading,
  onShare,
  miniChartSlot,
}: Props) {
  const { isFavorite, toggle } = useFavorite(marketId);
  const handleShare = useShare(onShare);
  const [alertOn, setAlertOn] = useState(false);

  const { theme } = useDataTheme();
  const isApple = theme === 'apple';
  const isUp = changeRate != null && changeRate > 0;
  const isDown = changeRate != null && changeRate < 0;
  const ytId = youtubeId ?? 'HosW0gulISQ';
  const thumbSrc =
    thumbnailUrl ??
    `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`;

  if (isApple) {
    const rateStr = changeRate != null && changeRate !== 0 ? `${isUp ? '+' : ''}${formatRate(changeRate)}` : '';
    const amountStr =
      changeAmountKrw != null && changeAmountKrw !== 0
        ? ` (${isUp ? '+' : ''}${Math.round(changeAmountKrw).toLocaleString('ko-KR')})`
        : '';
    const changeText = rateStr || amountStr ? `${rateStr}${amountStr}` : null;
    return (
      <section
        style={{
          padding: '48px 24px 32px',
          textAlign: 'center',
          background: '#ffffff',
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <img
            src={loading ? '/placeholder.png' : thumbSrc}
            alt=""
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              display: 'block',
              margin: '0 auto',
            }}
          />
        </div>

        <h1
          style={{
            fontSize: 20,
            fontWeight: 600,
            marginBottom: 12,
          }}
        >
          {loading ? '—' : title}
        </h1>

        <div
          style={{
            fontSize: 44,
            fontWeight: 700,
            marginBottom: 6,
          }}
        >
          {loading ? '—' : formatKrw(priceKrw)}
        </div>

        {changeText && (
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: '#2563EB',
            }}
          >
            {changeText}
          </div>
        )}
      </section>
    );
  }

  return (
    <header
      className="market-detail-header-v3"
      style={{
        padding: `${v3.padding.lg}px ${v3.padding.md}px`,
        borderBottom: '1px solid var(--border)',
        backgroundColor: 'var(--bg)',
      }}
    >
      {/* 1행: 뒤로 + 썸네일+종목 + 아이콘 */}
      <div className="flex items-center gap-4 mb-5">
        <Link
          href={backHref}
          className={iconBtnClass}
          style={{ color: 'var(--text)' }}
          aria-label="뒤로가기"
        >
          <ChevronLeft size={24} strokeWidth={2} />
        </Link>
        <div
          className="shrink-0 rounded-xl overflow-hidden bg-[var(--border)]"
          style={{ width: 56, height: 56 }}
        >
          {loading ? (
            <div className="w-full h-full animate-pulse bg-[var(--bg-secondary)]" />
          ) : (
            <img
              src={thumbSrc}
              alt=""
              className="object-cover w-full h-full"
              width={56}
              height={56}
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h1
            className="truncate"
            style={{
              fontSize: v3.subtitle.size,
              fontWeight: v3.subtitle.weight,
              color: 'var(--text)',
              lineHeight: 1.35,
            }}
          >
            {loading ? '—' : title}
          </h1>
          {symbol && (
            <p
              className="truncate mt-0.5"
              style={{ fontSize: v3.label.size, color: 'var(--text-secondary)' }}
            >
              {symbol}
            </p>
          )}
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={toggle}
            className={iconBtnClass}
            style={{ color: isFavorite ? '#EAB308' : 'var(--text-muted)' }}
            aria-label={isFavorite ? '즐겨찾기 해제' : '즐겨찾기'}
          >
            <Star size={22} fill={isFavorite ? 'currentColor' : 'none'} strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => setAlertOn((v) => !v)}
            className={`${iconBtnClass} relative`}
            style={{ color: alertOn ? 'var(--royal-blue)' : 'var(--text-muted)' }}
            aria-label="알림"
            title="추후 알림 설정 예정"
          >
            <Bell size={22} strokeWidth={2} />
            <span
              className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-amber-500"
              title="추후 알림 설정 예정"
            />
          </button>
          <button
            type="button"
            onClick={handleShare}
            className={iconBtnClass}
            style={{ color: 'var(--text-muted)' }}
            aria-label="공유"
          >
            <Share2 size={20} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* 2행: 현재가 + 등락 + 미니차트 */}
      <div className="flex items-end justify-between gap-6">
        <div className="flex-1 min-w-0 price-block">
          {loading ? (
            <div
              className="h-10 w-36 rounded animate-pulse"
              style={{ backgroundColor: 'var(--border)' }}
            />
          ) : (
            <>
              <div
                className="price tabular-nums"
                style={{
                  fontSize: v3.price.size,
                  fontWeight: v3.price.weight,
                  letterSpacing: '-0.02em',
                  color: 'var(--text)',
                  lineHeight: 1.05,
                  marginBottom: 8,
                }}
              >
                {formatKrw(priceKrw)}
              </div>
              {(changeRate != null || changeAmountKrw != null) && (
                <span
                  className="inline-flex items-center gap-1.5 tabular-nums w-fit"
                  style={{
                    padding: '4px 10px',
                    borderRadius: 999,
                    fontSize: v3.caption.size,
                    fontWeight: 600,
                    backgroundColor: isUp
                      ? 'rgba(34,197,94,0.15)'
                      : isDown
                        ? 'rgba(239,68,68,0.15)'
                        : 'var(--bg-secondary)',
                    color: isUp ? 'var(--emerald)' : isDown ? 'var(--accent-loss)' : 'var(--text-secondary)',
                  }}
                >
                  {changeRate != null && changeRate !== 0 && (
                    <span>{isUp ? '▲' : '▼'} {isUp ? '+' : ''}{formatRate(changeRate)}</span>
                  )}
                  {changeAmountKrw != null && changeAmountKrw !== 0 && (
                    <span>({isUp ? '+' : ''}{formatKrw(changeAmountKrw)})</span>
                  )}
                </span>
              )}
            </>
          )}
        </div>
        <div
          className="shrink-0 rounded-xl flex items-center justify-center"
          style={{
            width: 140,
            height: 80,
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: v3.cardRadius,
          }}
        >
          {miniChartSlot ?? (
            <div
              className="w-full h-full rounded-xl"
              style={{
                background: 'linear-gradient(90deg, var(--border) 0%, var(--border-strong) 100%)',
                opacity: 0.4,
              }}
            />
          )}
        </div>
      </div>
    </header>
  );
}

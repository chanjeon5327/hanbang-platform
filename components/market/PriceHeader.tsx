'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Star, Bell, Share2 } from 'lucide-react';
import { formatKrw, formatRate } from '@/lib/utils/format';
import { spacing, radius } from '@/lib/design/tokens';

const FAVORITES_KEY = 'hanbang_favorites';

type Props = {
  marketId: string;
  title: string;
  symbol?: string;
  backHref?: string;
  priceKrw: number;
  changeRate?: number | null;
  changeAmountKrw?: number | null;
  loading?: boolean;
  onShare?: () => void;
  /** 미니차트 영역 (placeholder 가능) */
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
        await navigator.share({
          title: document.title,
          url: window.location.href,
        });
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

export default function PriceHeader({
  marketId,
  title,
  symbol,
  backHref = '/market',
  priceKrw,
  changeRate,
  changeAmountKrw,
  loading,
  onShare,
  miniChartSlot,
}: Props) {
  const { isFavorite, toggle: toggleFavorite } = useFavorite(marketId);
  const handleShare = useShare(onShare);
  const [alertOn, setAlertOn] = useState(false);

  const isUp = changeRate != null && changeRate > 0;
  const isDown = changeRate != null && changeRate < 0;

  const iconBtnClass =
    'flex items-center justify-center min-w-[44px] min-h-[44px] rounded-lg transition hover:opacity-80';

  return (
    <header
      style={{
        padding: '32px 24px',
        borderBottom: '1px solid var(--border)',
        backgroundColor: 'var(--bg)',
      }}
    >
      {/* 1행: 뒤로 + 종목명 + 아이콘(우측 정렬) */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href={backHref}
          className={iconBtnClass}
          style={{ color: 'var(--text)' }}
          aria-label="뒤로가기"
        >
          <ChevronLeft size={24} strokeWidth={2} />
        </Link>
        <h1
          className="flex-1 min-w-0 truncate"
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: 'var(--text)',
            lineHeight: 1.4,
          }}
        >
          {title}
        </h1>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={toggleFavorite}
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

      {/* 2단: 좌(현재가+등락률) | 우(미니차트) */}
      <div
        className="flex items-stretch justify-between"
        style={{ gap: spacing.lg }}
      >
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          {loading ? (
            <div
              className="h-11 w-44 rounded animate-pulse"
              style={{ backgroundColor: 'var(--border)' }}
            />
          ) : (
            <div
              className="tabular-nums"
              style={{
                fontSize: 40,
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: 'var(--text)',
                lineHeight: 1.05,
                marginBottom: 8,
              }}
            >
              {formatKrw(priceKrw)}
            </div>
          )}
          {!loading && (changeRate != null || changeAmountKrw != null) && (
            <span
              className="inline-flex items-center gap-1.5 tabular-nums w-fit"
              style={{
                padding: '4px 10px',
                borderRadius: 999,
                fontSize: 14,
                fontWeight: 600,
                backgroundColor: isUp ? 'rgba(34,197,94,0.15)' : isDown ? 'rgba(239,68,68,0.15)' : 'var(--bg-secondary)',
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
        </div>
        {/* 미니차트 140x80 */}
        <div
          className="shrink-0 rounded-lg flex items-center justify-center"
          style={{
            width: 140,
            height: 80,
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: radius.sm,
          }}
        >
          {miniChartSlot ?? (
            <div
              className="w-full h-full rounded"
              style={{
                background: 'linear-gradient(90deg, var(--border) 0%, var(--border-strong) 100%)',
                opacity: 0.5,
              }}
            />
          )}
        </div>
      </div>
    </header>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { getYtThumb } from '@/lib/thumbnails';
import { FALLBACK_IDS } from '@/lib/constants/fallbackIds';

export type SponsoredPick = {
  id: string;
  productId: string;
  title: string;
  subtitle: string;
  thumbnailUrl: string;
  progress: number;
  yieldRate: number;
  ctaLabel: string;
};

const MOCK_FALLBACK: SponsoredPick = {
  id: 'sponsored-1',
  productId: FALLBACK_IDS.SAMPLE_1,
  title: '전문가 추천 청약/투자',
  subtitle: '안정적이고 높은 수익률을 원한다면?',
  thumbnailUrl: getYtThumb(0),
  progress: 72,
  yieldRate: 8.4,
  ctaLabel: '지금 참여하기',
};

/**
 * 스폰서 광고 슬롯 - /api/home/sponsored 경계
 * 관리자 설정 연동 시 이 훅만 교체
 */
export function useSponsoredPick(enabled = true): {
  pick: SponsoredPick | null;
  loading: boolean;
} {
  const [pick, setPick] = useState<SponsoredPick | null>(null);
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) {
      setPick(MOCK_FALLBACK);
      setLoading(false);
      return;
    }

    let cancelled = false;

    fetch('/api/home/sponsored')
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        const p = json?.pick;
        if (p?.productId) {
          setPick({
            id: p.id ?? p.productId,
            productId: p.productId,
            title: p.title ?? MOCK_FALLBACK.title,
            subtitle: p.subtitle ?? MOCK_FALLBACK.subtitle,
            thumbnailUrl: p.thumbnailUrl ?? p.thumbnail_url ?? MOCK_FALLBACK.thumbnailUrl,
            progress: Number(p.progress) ?? MOCK_FALLBACK.progress,
            yieldRate: Number(p.yieldRate) ?? p.yield_rate ?? MOCK_FALLBACK.yieldRate,
            ctaLabel: p.ctaLabel ?? p.cta_label ?? MOCK_FALLBACK.ctaLabel,
          });
        } else {
          setPick(MOCK_FALLBACK);
        }
      })
      .catch(() => {
        if (!cancelled) setPick(MOCK_FALLBACK);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [enabled]);

  return { pick: loading ? null : (pick ?? MOCK_FALLBACK), loading };
}

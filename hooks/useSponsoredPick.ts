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
  title: '?袁ⓓ�揶쏉옙 �빊遺우퓝 筌�?鍮�/?�딆쁽',
  subtitle: '?�뜆�젟?怨몄뵠���??誘�? ?�꼷�뵡�몴醫롮뱽 ?癒곕립?�끇�늺?',
  thumbnailUrl: getYtThumb(0),
  progress: 72,
  yieldRate: 8.4,
  ctaLabel: '筌욑옙疫�?筌〓챷肉�?�꼵由�',
};

/**
 * ?�끋猷�??�꽴臾롰�� ?�됤�� - /api/home/sponsored 野껋럡���
 * �꽴占썹뵳�딆쁽 ?�끉�젟 ?怨뺣짗 ?????�굝彛� �뤃癒�猿�
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

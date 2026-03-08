'use client';

import { useEffect, useState } from 'react';
import { getYtThumb } from '@/lib/thumbnails';
import { FALLBACK_IDS } from '@/lib/constants/fallbackIds';

export type RailItem = {
  id: string;
  title: string;
  thumbnail_url?: string;
  creator_name?: string;
  category?: string;
  platform?: string;
  score?: number;
  reason?: { code: string; text: string };
};

export type Rail = { key: string; title: string; items: RailItem[] };

const FALLBACK_RAILS: Rail[] = [
  { key: 'fallback-top', title: '인기 베스트', items: [
    { id: FALLBACK_IDS.SAMPLE_1, title: '음악의 시', creator_name: '유튜브', thumbnail_url: getYtThumb(0) },
    { id: FALLBACK_IDS.SAMPLE_2, title: '패션 로드', creator_name: '유튜브', thumbnail_url: getYtThumb(1) },
    { id: FALLBACK_IDS.SAMPLE_3, title: '뷰티 이미지', creator_name: '유튜브', thumbnail_url: getYtThumb(2) },
    { id: FALLBACK_IDS.SAMPLE_4, title: '스포츠 시즌 A', creator_name: '스포츠', thumbnail_url: getYtThumb(3) },
    { id: FALLBACK_IDS.SAMPLE_5, title: '도서 시즌 B', creator_name: '도서', thumbnail_url: getYtThumb(4) },
  ]},
  { key: 'fallback-hot', title: '최근 인기', items: [
    { id: FALLBACK_IDS.SAMPLE_6, title: '필름 하우스', creator_name: '영화', thumbnail_url: getYtThumb(5) },
    { id: FALLBACK_IDS.SAMPLE_7, title: '웹소설 드라마', creator_name: 'OTT', thumbnail_url: getYtThumb(6) },
    { id: FALLBACK_IDS.SAMPLE_8, title: '팟캐스트 시즌2', creator_name: '인기', thumbnail_url: getYtThumb(7) },
  ]},
];

function mapApiToRail(apiRail: { key?: string; title?: string; items?: unknown[] }): Rail | null {
  if (!apiRail?.items?.length) return null;
  const items = (apiRail.items as Record<string, unknown>[]).map((it) => ({
    id: String(it.id ?? ''),
    title: String(it.title ?? ''),
    thumbnail_url: it.thumbnail_url as string | undefined,
    creator_name: it.creator_name as string | undefined,
    category: it.category as string | undefined,
    platform: it.platform as string | undefined,
    score: it.score as number | undefined,
    reason: it.reason as { code: string; text: string } | undefined,
  }));
  return { key: apiRail.key ?? 'rail', title: apiRail.title ?? '추천', items };
}

/**
 * 異붿쿇 ?덉씪 API ??(寃쎄퀎 遺꾨━)
 * - /api/home/rails ?ъ슜, Stub ?붿쭊 ?꾪솚 ?????낅쭔 援먯껜
 */
export function useRecommendedRails(enabled = true): { rails: Rail[]; loading: boolean } {
  const [rails, setRails] = useState<Rail[]>([]);
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    fetch('/api/home/rails', { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        const apiRails = json?.rails ?? [];
        const mapped: Rail[] = [];
        apiRails.forEach((r: { key?: string; title?: string; items?: unknown[] }) => {
          const rail = mapApiToRail(r);
          if (rail) mapped.push(rail);
        });
        if (mapped.length > 0) setRails(mapped);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [enabled]);

  const displayRails = loading || rails.length === 0 ? FALLBACK_RAILS : rails;

  const titleMap: Record<string, string> = {
    top: '?ㅻ뒛??異붿쿇',
    experiment: '留덇컧?꾨컯',
    'fallback-top': '?ㅻ뒛??異붿쿇',
    'fallback-hot': '留덇컧?꾨컯',
  };

  const minRails: Rail[] = displayRails.slice(0, 2).map((r) => ({
    ...r,
    title: titleMap[r.key] ?? r.title,
  }));

  return { rails: minRails, loading };
}

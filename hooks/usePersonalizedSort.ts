'use client';

import { useMemo } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';

/**
 * 개인화 정렬 준비 훅
 * - user_id 기반 추천 점수 정렬
 * - 로그인 시 점수 기반, 비로그인 시 기본 정렬
 * - 알고리즘은 더미 (실제 API 연동 시 교체)
 */
export type SortableItem = {
  id: string;
  [key: string]: unknown;
};

export function usePersonalizedSort<T extends SortableItem>(
  items: T[],
  userId: string | undefined,
  options?: {
    /** 정렬 키 (기본: id) */
    sortKey?: string;
    /** 추천 점수 필드 (API에서 오면 이 필드 사용) */
    scoreField?: string;
  }
): T[] {
  const { user } = useAuth();
  const effectiveUserId = userId ?? user?.id;

  return useMemo(() => {
    if (items.length === 0) return items;

    // TODO: 로그인 시 실제 추천 API 호출
    // GET /api/recommend?user_id={userId}&content_ids=...
    // 응답: { scores: { [id]: number } }
    if (effectiveUserId) {
      // 더미: user_id 해시 기반 의사 랜덤 정렬 (같은 유저에게는 일관된 순서)
      const hash = (s: string): number => {
        let h = 0;
        for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
        return Math.abs(h);
      };
      const seed = hash(effectiveUserId);
      return [...items].sort((a, b) => {
        const rawA = options?.scoreField && typeof a[options.scoreField] === 'number' ? (a[options.scoreField] as number) : null;
        const rawB = options?.scoreField && typeof b[options.scoreField] === 'number' ? (b[options.scoreField] as number) : null;
        const scoreA: number = rawA ?? (hash(a.id + String(seed)) % 100);
        const scoreB: number = rawB ?? (hash(b.id + String(seed)) % 100);
        return scoreB - scoreA;
      });
    }

    return items;
  }, [items, effectiveUserId, options?.scoreField]);
}

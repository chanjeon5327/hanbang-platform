'use client';

import { useMemo } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';

/**
 * 揶쏆뮇�뵥???類ｌ졊 餓ο옙�뜮???
 * - user_id 疫꿸퀡而� �빊遺우퓝 ?癒��땾 ?類ｌ졊
 * - 嚥≪뮄�젃?????癒��땾 疫꿸퀡而�, �뜮袁⑥쨮域밸챷�뵥 ??疫꿸퀡�궚 ?類ｌ졊
 * - ?�슡��х뵳�딆촿?占� ?遺�? (?�끉�젫 API ?怨뺣짗 ??�뤃癒�猿�)
 */
export type SortableItem = {
  id: string;
  [key: string]: unknown;
};

export function usePersonalizedSort<T extends SortableItem>(
  items: T[],
  userId: string | undefined,
  options?: {
    /** ?類ｌ졊 ??(疫꿸퀡�궚: id) */
    sortKey?: string;
    /** �빊遺우퓝 ?癒��땾 ?袁⑤굡 (API?癒�苑� ?�끇�늺 ???袁⑤굡 ?�딆뒠) */
    scoreField?: string;
  }
): T[] {
  const { user } = useAuth();
  const effectiveUserId = userId ?? user?.id;

  return useMemo(() => {
    if (items.length === 0) return items;

    // TODO: 嚥≪뮄�젃?????�끉�젫 �빊遺우퓝 API ?紐꾪뀱
    // GET /api/recommend?user_id={userId}&content_ids=...
    // ?臾먮뼗: { scores: { [id]: number } }
    if (effectiveUserId) {
      // ?遺�?: user_id ?�똻�뻻 疫꿸퀡而� ?�꼷沅� ?�뮆�쑁 ?類ｌ졊 (揶쏆늿? ?醫�??癒�苡�???�눊????�뮇苑�)
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

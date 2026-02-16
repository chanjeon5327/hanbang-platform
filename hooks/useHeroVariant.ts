'use client';

import { useEffect, useState } from 'react';
import { logEvent } from '@/utils/logEvent';

export type HeroVariant = 'A' | 'B';

export function useHeroVariant(): HeroVariant {
  const [variant, setVariant] = useState<HeroVariant>('A');

  useEffect(() => {
    // ?몄뀡 ?⑥쐞 A/B 怨좎젙
    const saved = sessionStorage.getItem('hero_variant') as HeroVariant | null;
    if (saved) {
      setVariant(saved);
      return;
    }

    const v: HeroVariant = Math.random() < 0.5 ? 'A' : 'B';
    sessionStorage.setItem('hero_variant', v);
    setVariant(v);

    logEvent('hero_exposed', { variant: v });
  }, []);

  return variant;
}

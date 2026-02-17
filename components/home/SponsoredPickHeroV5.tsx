'use client';

import Link from 'next/link';
import { formatRate } from '@/lib/utils/format';
import { useSponsoredPick } from '@/hooks/useSponsoredPick';
import { CardV5 } from '@/components/ui/CardV5';
import Skeleton from '@/components/ui/Skeleton';

export default function SponsoredPickHeroV5() {
  const { pick, loading } = useSponsoredPick(true);

  if (loading || !pick) {
    return (
      <div className="px-4" style={{ paddingTop: 'var(--space-lg)' }}>
        <div className="rounded-[20px] overflow-hidden" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}>
          <Skeleton className="aspect-[16/9] w-full" />
          <div className="p-5">
            <Skeleton className="h-6 w-3/4 mb-3" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4" style={{ paddingTop: 'var(--space-lg)' }}>
      <Link href={`/market/${pick.productId}`} className="block">
        <CardV5 noPadding className="overflow-hidden">
          <div className="relative aspect-[16/9]" style={{ backgroundColor: 'var(--border)' }}>
            <span
              className="absolute top-2 left-2 z-10 inline-flex items-center px-2 py-0.5 rounded caption font-medium"
              style={{ backgroundColor: 'var(--royal-blue)', color: '#fff' }}
            >
              공식 스폰서 픽
            </span>
            <img
              src={pick.thumbnailUrl}
              alt=""
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>
          <div className="p-5">
            <h3 className="body font-bold line-clamp-2 leading-snug" style={{ color: 'var(--text)' }}>
              {pick.title}
            </h3>
            <div className="flex gap-4 mt-2">
              <div>
                <span className="caption block" style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>현재가</span>
                <span className="metric-lg font-bold tabular-nums metric-number" style={{ color: 'var(--text)' }}>{pick.sharePriceKrw != null ? `₩${pick.sharePriceKrw.toLocaleString()}` : '—'}</span>
              </div>
              <div>
                <span className="caption block" style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>예상수익률</span>
                <span className="metric-lg font-bold tabular-nums metric-number" style={{ color: 'var(--emerald)' }}>{formatRate(pick.yieldRate)}</span>
              </div>
            </div>
            <div
              className="mt-4 py-3 rounded-xl body font-bold text-center"
              style={{ backgroundColor: 'var(--royal-blue)', color: '#fff' }}
            >
              {pick.ctaLabel}
            </div>
            <p className="caption text-center mt-2" style={{ color: 'var(--text-muted)' }}>배당 기반 수익 구조</p>
          </div>
        </CardV5>
      </Link>
    </div>
  );
}

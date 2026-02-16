'use client';

import Link from 'next/link';
import { getYtThumb } from '@/lib/thumbnails';
import { ChevronRight } from 'lucide-react';

const TOSS = {
  card: '#ffffff',
  blue: '#3182f6',
  text: '#191f28',
  secondary: '#6b7684',
  border: '#e5e8eb',
  positive: '#00c48c',
  negative: '#eb4d3d',
} as const;

export type MarketCardItem = {
  id: string;
  title: string;
  creator_name?: string;
  category?: string;
  thumbnail_url?: string;
  price?: number;
  change?: number;
  progress?: number;
  remainingText?: string;
  revenueBadge?: string;
  risk?: 'low' | 'mid' | 'high';
  tags?: string[];
  summary?: string;
  type?: 'mobilization' | 'secondary';
};

type Props = {
  item: MarketCardItem;
  index: number;
  variant?: 'horizon' | 'vertical' | 'list';
};

/** 토스형 리스트 카드: 썸네일/요약/수익모델/모집률/잔여시간 한눈에 비교 */
function ListCard({ item, index }: { item: MarketCardItem; index: number }) {
  const thumbSrc = item.thumbnail_url || getYtThumb(index);
  const change = item.change ?? 0;
  const price = item.price ?? 0;
  const progress = item.progress ?? 0;
  const summary = item.summary ?? `${item.title} · ${item.creator_name ?? item.category ?? ''}`;

  return (
    <Link
      href={`/market/${item.id}`}
      data-testid="market-card"
      className="group flex gap-4 p-4 rounded-2xl border border-black/5 active:opacity-95 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--toss-blue)] focus:ring-offset-2"
      style={{ backgroundColor: TOSS.card, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
      aria-label={`${item.title} 수익권 상세 보기`}
    >
      {/* 썸네일 */}
      <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-black/5">
        <img src={thumbSrc} alt="" className="w-full h-full object-cover group-hover:opacity-95 transition-transform" loading="lazy" />
      </div>

      <div className="flex-1 min-w-0">
        {/* 작품명 + 수익모델 */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="body font-bold line-clamp-1" style={{ color: TOSS.text }}>{item.title}</h3>
          {item.revenueBadge && (
            <span className="shrink-0 rounded-lg px-2 py-0.5 caption font-semibold" style={{ backgroundColor: 'rgba(49,130,246,0.12)', color: TOSS.blue }}>
              {item.revenueBadge}
            </span>
          )}
        </div>

        {/* 요약 (크리에이터) */}
        <p className="caption mt-0.5 line-clamp-2" style={{ color: TOSS.secondary }}>{summary}</p>

        {/* 가격 + 등락률 */}
        <div className="flex items-baseline gap-2 mt-2">
          <span className="body-sm font-bold tabular-nums" style={{ color: TOSS.text }}>₩{price.toLocaleString()}</span>
          <span className="caption font-semibold tabular-nums" style={{ color: change >= 0 ? TOSS.positive : TOSS.negative }}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
        </div>

        {/* 모집률 + 잔여시간 */}
        <div className="flex items-center gap-3 mt-2">
          {progress > 0 && (
            <div className="flex-1 min-w-0">
              <div className="flex justify-between caption mb-0.5" style={{ color: TOSS.secondary }}>
                <span>모집률</span>
                <span className="font-medium" style={{ color: TOSS.text }}>{progress}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: TOSS.border }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, progress)}%`, backgroundColor: TOSS.blue }} />
              </div>
            </div>
          )}
          {item.remainingText && (
            <span className="shrink-0 caption font-semibold px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(235,77,61,0.12)', color: TOSS.negative }}>
              {item.remainingText}
            </span>
          )}
        </div>
      </div>

      <ChevronRight size={20} className="shrink-0" style={{ color: TOSS.secondary }} />
    </Link>
  );
}

export default function MarketCard({ item, index, variant = 'list' }: Props) {
  const thumbSrc = item.thumbnail_url || getYtThumb(index);
  const change = item.change ?? 0;
  const price = item.price ?? 0;
  const progress = item.progress ?? 0;

  if (variant === 'list') {
    return <ListCard item={item} index={index} />;
  }

  if (variant === 'horizon') {
    const summary = item.summary ?? `${item.title} · ${item.creator_name ?? item.category ?? ''}`;
    return (
      <Link
        href={`/market/${item.id}`}
        data-testid="market-card"
        className="group flex gap-4 p-4 rounded-2xl border border-black/5 active:opacity-95 transition-all"
        style={{ backgroundColor: TOSS.card, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        aria-label={`${item.title} 수익권 보기`}
      >
        <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0">
          <img src={thumbSrc} alt="" className="w-full h-full object-cover group-hover:opacity-95 transition-transform" loading="lazy" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="body font-bold line-clamp-1" style={{ color: TOSS.text }}>{item.title}</h3>
            {item.revenueBadge && (
              <span className="shrink-0 rounded px-2 py-0.5 caption font-semibold" style={{ backgroundColor: 'rgba(49,130,246,0.15)', color: TOSS.blue }}>{item.revenueBadge}</span>
            )}
          </div>
          <p className="caption mt-0.5 truncate" style={{ color: TOSS.secondary }}>{summary}</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="body-sm font-bold tabular-nums" style={{ color: TOSS.text }}>₩{price.toLocaleString()}</span>
            <span className="caption font-semibold tabular-nums" style={{ color: change >= 0 ? TOSS.positive : TOSS.negative }}>
              {change >= 0 ? '+' : ''}{change}%
            </span>
          </div>
          {progress > 0 && (
            <div className="mt-2">
              <div className="flex justify-between caption mb-1" style={{ color: TOSS.secondary }}>
                <span>모집률</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: TOSS.border }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, progress)}%`, backgroundColor: TOSS.blue }} />
              </div>
            </div>
          )}
          {item.remainingText && (
            <p className="caption mt-1" style={{ color: TOSS.negative }}>{item.remainingText}</p>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/market/${item.id}`}
      data-testid="market-card"
      className="group flex-shrink-0 block focus:outline-none focus:ring-2 focus:ring-[var(--toss-blue)] focus:ring-offset-2 rounded-2xl"
      style={{ width: 160 }}
      aria-label={`${item.title} 수익권 보기`}
    >
      <div className="relative overflow-hidden rounded-2xl border border-black/5 active:opacity-95 transition-all duration-200" style={{ backgroundColor: TOSS.card, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div className="aspect-[4/5] relative overflow-hidden">
          <img src={thumbSrc} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:opacity-95" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" aria-hidden />
          {item.revenueBadge && (
            <span className="absolute top-2 left-2 rounded px-2 py-0.5 caption font-semibold text-white" style={{ backgroundColor: TOSS.blue }}>{item.revenueBadge}</span>
          )}
          {item.remainingText && (
            <span className="absolute top-2 right-2 rounded px-2 py-0.5 caption font-bold text-white" style={{ backgroundColor: TOSS.negative }}>{item.remainingText}</span>
          )}
          <div className="absolute bottom-2 left-2 right-2">
            <span className="body-sm font-bold text-white  line-clamp-1">{item.title}</span>
            <span className="caption text-white/90">{item.creator_name ?? item.category ?? '-'}</span>
          </div>
        </div>
        <div className="p-3">
          <div className="flex items-baseline justify-between gap-2">
            <span className="body-sm font-bold tabular-nums" style={{ color: TOSS.text }}>₩{price.toLocaleString()}</span>
            <span className="caption font-semibold tabular-nums" style={{ color: change >= 0 ? TOSS.positive : TOSS.negative }}>
              {change >= 0 ? '+' : ''}{change}%
            </span>
          </div>
          {progress > 0 && (
            <div className="mt-2">
              <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: TOSS.border }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, progress)}%`, backgroundColor: TOSS.blue }} />
              </div>
              <p className="caption mt-0.5" style={{ color: TOSS.secondary }}>모집 {progress}%</p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

'use client';

import Link from 'next/link';
import { getYtThumb } from '@/lib/thumbnails';

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
  variant?: 'horizon' | 'vertical';
};

export default function MarketCard({ item, index, variant = 'vertical' }: Props) {
  const thumbSrc = item.thumbnail_url || getYtThumb(index);
  const change = item.change ?? 0;
  const price = item.price ?? 0;
  const progress = item.progress ?? 0;

  if (variant === 'horizon') {
    return (
      <Link
        href={`/market/${item.id}`}
        data-testid="market-card"
        className="group flex gap-4 p-4 rounded-2xl border border-black/5 active:scale-[0.99] transition-all"
        style={{ backgroundColor: TOSS.card, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        aria-label={`${item.title} 수익권 보기`}
      >
        <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0">
          <img src={thumbSrc} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-[15px] font-bold line-clamp-1" style={{ color: TOSS.text }}>{item.title}</h3>
            {item.revenueBadge && (
              <span className="shrink-0 rounded px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: 'rgba(49,130,246,0.15)', color: TOSS.blue }}>{item.revenueBadge}</span>
            )}
          </div>
          <p className="text-[12px] mt-0.5 truncate" style={{ color: TOSS.secondary }}>{item.creator_name ?? item.category ?? '-'}</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-[14px] font-bold tabular-nums" style={{ color: TOSS.text }}>₩{price.toLocaleString()}</span>
            <span className="text-[12px] font-semibold tabular-nums" style={{ color: change >= 0 ? TOSS.positive : TOSS.negative }}>
              {change >= 0 ? '+' : ''}{change}%
            </span>
          </div>
          {progress > 0 && (
            <div className="mt-2">
              <div className="flex justify-between text-[11px] mb-1" style={{ color: TOSS.secondary }}>
                <span>모집률</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: TOSS.border }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, progress)}%`, backgroundColor: TOSS.blue }} />
              </div>
            </div>
          )}
          {item.remainingText && (
            <p className="text-[11px] mt-1" style={{ color: TOSS.secondary }}>{item.remainingText}</p>
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
      <div className="relative overflow-hidden rounded-2xl border border-black/5 active:scale-[0.97] transition-all duration-200" style={{ backgroundColor: TOSS.card, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div className="aspect-[4/5] relative overflow-hidden">
          <img src={thumbSrc} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" aria-hidden />
          {item.revenueBadge && (
            <span className="absolute top-2 left-2 rounded px-2 py-0.5 text-[10px] font-semibold text-white" style={{ backgroundColor: TOSS.blue }}>{item.revenueBadge}</span>
          )}
          {item.remainingText && (
            <span className="absolute top-2 right-2 rounded px-2 py-0.5 text-[10px] font-bold text-white" style={{ backgroundColor: TOSS.negative }}>{item.remainingText}</span>
          )}
          <div className="absolute bottom-2 left-2 right-2">
            <span className="text-[13px] font-bold text-white drop-shadow-md line-clamp-1">{item.title}</span>
            <span className="text-[11px] text-white/90">{item.creator_name ?? item.category ?? '-'}</span>
          </div>
        </div>
        <div className="p-3">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[14px] font-bold tabular-nums" style={{ color: TOSS.text }}>₩{price.toLocaleString()}</span>
            <span className="text-[12px] font-semibold tabular-nums" style={{ color: change >= 0 ? TOSS.positive : TOSS.negative }}>
              {change >= 0 ? '+' : ''}{change}%
            </span>
          </div>
          {progress > 0 && (
            <div className="mt-2">
              <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: TOSS.border }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, progress)}%`, backgroundColor: TOSS.blue }} />
              </div>
              <p className="text-[10px] mt-0.5" style={{ color: TOSS.secondary }}>모집 {progress}%</p>
            </div>
          )}
        </div>
        {/* hover 상세 요약 */}
        {item.summary && (
          <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center p-4 pointer-events-none">
            <p className="text-[13px] text-white line-clamp-4 text-center">{item.summary}</p>
          </div>
        )}
      </div>
    </Link>
  );
}

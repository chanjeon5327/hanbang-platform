'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { getYtThumb } from '@/lib/thumbnails';
import { useInterestToggle } from '@/hooks/useInterestToggle';
import { useAuth } from '@/components/auth/AuthProvider';

const TOSS = {
  card: '#ffffff',
  text: '#191f28',
  blue: '#3182f6',
  secondary: '#6b7684',
  border: '#e5e8eb',
  negative: '#eb4d3d',
} as const;

export type MarketGridItem = {
  id: string;
  title: string;
  creator_name?: string;
  category?: string;
  thumbnail_url?: string;
  deadline?: string | null;
};

type Props = {
  item: MarketGridItem;
  index: number;
  showDeadlineBadge?: boolean;
  isInterested?: boolean;
};

export default function MarketGridCard({ item, index, showDeadlineBadge = false, isInterested: initialInterested = false }: Props) {
  const { user } = useAuth();
  const { isInterested, toggle, loading } = useInterestToggle(item.id, initialInterested);
  const thumbSrc = item.thumbnail_url ?? getYtThumb(index);

  return (
    <Link
      href={`/market/${item.id}`}
      className="block rounded-2xl overflow-hidden border active:scale-[0.98] transition focus:outline-none focus:ring-2 focus:ring-[var(--toss-blue)] focus:ring-offset-2"
      style={{ backgroundColor: TOSS.card, borderColor: TOSS.border, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
      aria-label={`${item.title} 수익권 보기`}
    >
      <div className="relative aspect-[4/5] bg-[#e5e8eb]">
        <img src={thumbSrc} alt="" className="w-full h-full object-cover" loading="lazy" />
        {showDeadlineBadge && (
          <span className="absolute top-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ backgroundColor: TOSS.negative }}>
            마감임박
          </span>
        )}
        {user && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggle();
            }}
            disabled={loading}
            className="absolute top-2 left-2 p-1.5 rounded-full bg-black/40 backdrop-blur-sm disabled:opacity-50"
            aria-label={isInterested ? '관심 해제' : '관심 등록'}
          >
            <Heart
              size={18}
              className={isInterested ? 'fill-red-500 text-red-500' : 'text-white'}
              strokeWidth={2}
            />
          </button>
        )}
      </div>
      <div className="p-3">
        <div className="text-[14px] font-semibold line-clamp-2 leading-snug" style={{ color: TOSS.text }}>{item.title}</div>
        {item.creator_name && (
          <div className="text-[12px] mt-0.5 truncate" style={{ color: TOSS.secondary }}>{item.creator_name}</div>
        )}
      </div>
    </Link>
  );
}

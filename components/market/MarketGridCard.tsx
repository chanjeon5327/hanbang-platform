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

const PREVIEW_URL = (id: string) =>
  `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=0&playsinline=1&modestbranding=1&rel=0&cc_load_policy=0&iv_load_policy=3&loop=1&playlist=${id}`;

export type MarketGridItem = {
  id: string;
  title: string;
  creator_name?: string;
  category?: string;
  thumbnail_url?: string;
  youtube_id?: string | null;
  deadline?: string | null;
  total_raise?: number;
  current_raise?: number;
  participants?: number;
  event_date?: string | null;
  integrity_ok?: boolean;
  settlement_count?: number;
};

type Props = {
  item: MarketGridItem;
  index: number;
  showDeadlineBadge?: boolean;
  isInterested?: boolean;
  activePreviewId?: string | null;
  onPreviewActive?: (id: string | null) => void;
};

function getDday(eventDate: string | null | undefined): number | null {
  if (!eventDate) return null;
  const d = new Date(eventDate);
  const now = new Date();
  const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff >= 0 ? diff : null;
}

export default function MarketGridCard({
  item,
  index,
  showDeadlineBadge = false,
  isInterested: initialInterested = false,
  activePreviewId = null,
  onPreviewActive,
}: Props) {
  const { user } = useAuth();
  const { isInterested, toggle, loading } = useInterestToggle(item.id, initialInterested);
  const thumbSrc = item.thumbnail_url ?? getYtThumb(index);
  const dday = getDday(item.event_date);
  const youtubeId = item.youtube_id ?? null;
  const showPreview = activePreviewId === item.id && youtubeId;

  const isUrgent = dday != null && dday <= 3;

  const handlePointerEnter = () => onPreviewActive?.(item.id);
  const handlePointerLeave = () => onPreviewActive?.(null);
  const handlePointerDown = () => onPreviewActive?.(item.id);
  const handlePointerUp = () => onPreviewActive?.(null);
  const handlePointerCancel = () => onPreviewActive?.(null);

  return (
    <Link
      href={`/market/${item.id}`}
      className={`block rounded-2xl overflow-hidden border active:scale-[0.98] transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        isUrgent ? 'focus:ring-red-500 border-2 animate-pulse' : 'focus:ring-[var(--toss-blue)]'
      }`}
      style={{
        backgroundColor: TOSS.card,
        borderColor: isUrgent ? '#dc2626' : TOSS.border,
        boxShadow: isUrgent ? '0 0 12px rgba(220,38,38,0.3)' : '0 2px 8px rgba(0,0,0,0.06)',
      }}
      aria-label={`${item.title} 수익권 보기`}
      onPointerEnter={youtubeId ? handlePointerEnter : undefined}
      onPointerLeave={youtubeId ? handlePointerLeave : undefined}
      onPointerDown={youtubeId ? handlePointerDown : undefined}
      onPointerUp={youtubeId ? handlePointerUp : undefined}
      onPointerCancel={youtubeId ? handlePointerCancel : undefined}
    >
      {isUrgent && (
        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #dc2626, #ef4444)' }} />
      )}
      <div className="relative aspect-[4/5] bg-[#e5e8eb]">
        {showPreview ? (
          <iframe
            src={PREVIEW_URL(youtubeId)}
            title=""
            className="absolute inset-0 w-full h-full object-cover"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <img src={thumbSrc} alt="" className="w-full h-full object-cover" loading="lazy" />
        )}
        <div className="absolute top-2 right-2 flex flex-wrap justify-end gap-1.5">
          {item.integrity_ok && (item.settlement_count ?? 0) > 0 && (
            <span className="rounded px-1.5 py-0.5 text-[9px] font-medium bg-emerald-600/90 text-white shrink-0">
              정산완료 {item.settlement_count}건
            </span>
          )}
          {item.integrity_ok && (item.settlement_count ?? 0) === 0 && (
            <span className="rounded px-1.5 py-0.5 text-[9px] font-medium bg-sky-600/90 text-white shrink-0">
              원장 검증 완료
            </span>
          )}
          {dday != null && (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
              style={
                isUrgent
                  ? { background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }
                  : { backgroundColor: '#ef4444' }
              }
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              D-{dday} 공연 임박
            </span>
          )}
          {showDeadlineBadge ? (
            <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ backgroundColor: TOSS.negative }}>
              마감임박
            </span>
          ) : !dday && (
            <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white bg-emerald-500">
              LIVE
            </span>
          )}
        </div>
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
        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="h-1.5 rounded-full overflow-hidden bg-black/10">
              <div
                className="h-full rounded-full bg-[var(--toss-blue)] transition-all"
                style={{ width: `${Math.min(100, ((item.current_raise ?? 0) / Math.max(1, item.total_raise ?? 1)) * 100)}%` }}
              />
            </div>
          </div>
          <span className="text-[12px] font-bold shrink-0" style={{ color: TOSS.text }}>
            {Math.min(100, Math.round(((item.current_raise ?? 0) / Math.max(1, item.total_raise ?? 1)) * 100))}%
          </span>
        </div>
        {(item.participants ?? 0) > 0 && (
          <div className="text-[11px] mt-1" style={{ color: TOSS.secondary }}>
            {item.participants}명 참여
          </div>
        )}
      </div>
    </Link>
  );
}

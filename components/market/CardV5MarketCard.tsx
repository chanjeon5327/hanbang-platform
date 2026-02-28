'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { FALLBACK_PREVIEW_IMAGE, PRODUCT_PLACEHOLDER } from '@/lib/thumbnails';
import { useInterestToggle } from '@/hooks/useInterestToggle';
import { useAuth } from '@/components/auth/AuthProvider';
import { formatKrw } from '@/lib/utils/format';
import MetricRow from '@/components/ui/MetricRow';
import type { RailItem } from '@/hooks/useMarketTab';

const PREVIEW_URL = (id: string) =>
  `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=0&playsinline=1&modestbranding=1&rel=0&cc_load_policy=0&iv_load_policy=3&loop=1&playlist=${id}`;

function getDday(eventDate: string | null | undefined): number | null {
  if (!eventDate) return null;
  const d = new Date(eventDate);
  const now = new Date();
  const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff >= 0 ? diff : null;
}

type Props = {
  item: RailItem;
  index: number;
  showDeadlineBadge?: boolean;
  isInterested?: boolean;
  activePreviewId?: string | null;
  onPreviewActive?: (id: string | null) => void;
  change?: number;
};

export default function CardV5MarketCard({
  item,
  index,
  showDeadlineBadge = false,
  isInterested: initialInterested = false,
  activePreviewId = null,
  onPreviewActive,
  change,
}: Props) {
  const { user } = useAuth();
  const { isInterested, toggle, loading } = useInterestToggle(item.id, initialInterested);
  const thumbSrc =
    item.thumbnail_url ??
    (item.youtube_id ? `https://i.ytimg.com/vi/${item.youtube_id}/hqdefault.jpg` : FALLBACK_PREVIEW_IMAGE);
  const dday = getDday(item.event_date);
  const youtubeId = item.youtube_id ?? null;
  const showPreview = activePreviewId === item.id && youtubeId;

  const isUrgent = dday != null && dday <= 3;
  const totalRaise = item.total_raise ?? 0;
  const currentRaise = item.current_raise ?? 0;
  const progress = totalRaise > 0 ? Math.min(100, (currentRaise / totalRaise) * 100) : 0;
  const isPositive = (change ?? 0) >= 0;
  const yieldDisplay =
    change !== undefined && change !== 0
      ? `${isPositive ? '+' : ''}${change}%`
      : totalRaise > 0
        ? `${progress.toFixed(0)}% 모집`
        : '—';

  const handlePointerEnter = () => onPreviewActive?.(item.id);
  const handlePointerLeave = () => onPreviewActive?.(null);
  const handlePointerDown = () => onPreviewActive?.(item.id);
  const handlePointerUp = () => onPreviewActive?.(null);
  const handlePointerCancel = () => onPreviewActive?.(null);

  const metricItems = [
    { label: '참여자', value: `${item.participants ?? 0}명` },
    { label: '정산', value: `${item.settlement_count ?? 0}건` },
    { label: '원장', value: item.integrity_ok ? '검증' : '—' },
  ];

  return (
    <Link
      href={`/market/${item.id}`}
      className="block overflow-hidden hb-card-hover focus:outline-none focus:ring-2 focus:ring-[var(--royal-blue)] focus:ring-offset-2 active:opacity-90 group"
      style={{
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        backgroundColor: 'var(--card)',
        padding: '20px',
      }}
      aria-label={`${item.title} 수익권 보기`}
      onPointerEnter={youtubeId ? handlePointerEnter : undefined}
      onPointerLeave={youtubeId ? handlePointerLeave : undefined}
      onPointerDown={youtubeId ? handlePointerDown : undefined}
      onPointerUp={youtubeId ? handlePointerUp : undefined}
      onPointerCancel={youtubeId ? handlePointerCancel : undefined}
    >
      <div className="flex flex-col" style={{ gap: 'var(--space-md)' }}>
        <div className="flex items-start justify-between gap-2">
          <h3 className="body font-bold line-clamp-2 leading-snug flex-1" style={{ color: 'var(--text)', marginBottom: 6 }}>
            {item.title}
          </h3>
          <div className="flex flex-wrap justify-end gap-1 shrink-0 transition-opacity duration-150 group-hover:opacity-90" style={{ fontSize: '0.7rem', opacity: 0.65 }}>
            {item.integrity_ok && (item.settlement_count ?? 0) > 0 && (
              <span className="rounded-full px-1.5 py-0.5 caption border" style={{ backgroundColor: 'var(--emerald)', color: '#fff', borderColor: 'var(--emerald)' }}>
                정산 {item.settlement_count}건
              </span>
            )}
            {item.integrity_ok && (item.settlement_count ?? 0) === 0 && (
              <span className="rounded-full px-1.5 py-0.5 caption border" style={{ backgroundColor: 'var(--royal-blue)', color: '#fff', borderColor: 'var(--royal-blue)' }}>
                원장검증
              </span>
            )}
            {item.product_type === 'DIVIDEND_TRADABLE' && !item.integrity_ok && (
              <span className="rounded-full px-1.5 py-0.5 caption border" style={{ backgroundColor: 'var(--emerald)', color: '#fff', borderColor: 'var(--emerald)' }}>
                배당진행중
              </span>
            )}
            {dday != null && (
              <span className="rounded px-1.5 py-0.5 caption font-bold text-white" style={{ backgroundColor: 'var(--accent-loss)', opacity: 0.8 }}>
                D-{dday}
              </span>
            )}
          </div>
        </div>

        <div className="relative overflow-hidden" style={{ aspectRatio: '2/1', backgroundColor: 'var(--border)', borderRadius: 'var(--thumb-radius)' }}>
          {showPreview && youtubeId ? (
            <iframe
              src={PREVIEW_URL(youtubeId)}
              title=""
              className="absolute inset-0 w-full h-full object-cover hb-thumb-zoom"
              style={{ filter: 'brightness(0.9)' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <img
              src={thumbSrc}
              alt=""
              className="w-full h-full object-cover hb-thumb-zoom"
              style={{ filter: 'brightness(0.9)' }}
              loading="lazy"
              onError={(e) => {
                const el = e.currentTarget;
                if (!el.src.includes('placeholders/')) el.src = PRODUCT_PLACEHOLDER;
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" aria-hidden />
          {user && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggle();
              }}
              disabled={loading}
              className="absolute top-2 left-2 p-1.5 rounded-full bg-black/40 disabled:opacity-50"
              aria-label={isInterested ? '관심 해제' : '관심 등록'}
            >
              <Heart size={18} className={isInterested ? 'fill-red-500 text-red-500' : 'text-white'} strokeWidth={2} />
            </button>
          )}
        </div>

        <div style={{ marginTop: 6 }}>
          <div className="metric-lg metric-number font-extrabold" style={{ color: 'var(--text)', letterSpacing: '-0.03em' }}>
            {totalRaise > 0 ? formatKrw(totalRaise) : '—'}
          </div>
          <div
            className="body font-bold metric-number mt-0.5"
            style={{
              color:
                change !== undefined && change !== 0
                  ? isPositive ? 'var(--emerald)' : 'var(--accent-loss)'
                  : 'var(--royal-blue)',
            }}
          >
            {yieldDisplay}
          </div>
        </div>

        <MetricRow items={metricItems} columns={3} dense />

        {totalRaise > 0 && (
          <div>
            <div className="flex justify-between caption mb-0.5" style={{ color: 'var(--text-secondary)' }}>
              <span>모집률</span>
              <span className="font-medium metric-number" style={{ color: 'var(--text)' }}>{progress.toFixed(0)}%</span>
            </div>
            <div className="rounded-full overflow-hidden" style={{ height: 4, backgroundColor: 'var(--border)' }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: 'var(--royal-blue)' }} />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

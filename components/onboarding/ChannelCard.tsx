'use client';

import { getYtThumb } from '@/lib/thumbnails';

export type Channel = {
  id: string;
  name: string;
  slug?: string;
  category?: string;
  thumbnail_url?: string | null;
  keywords?: string | string[] | null;
};

export type RatingType = 'like' | 'dislike' | 'later';

type Props = {
  channel: Channel;
  index: number;
  rating: RatingType | null;
  onRate: (type: RatingType) => void;
};

export default function ChannelCard({ channel, index, rating, onRate }: Props) {
  const thumb =
    channel.thumbnail_url ?? getYtThumb(index);

  const keywordsStr = Array.isArray(channel.keywords)
    ? channel.keywords.join(' · ')
    : typeof channel.keywords === 'string'
      ? channel.keywords
      : channel.category ?? '콘텐츠';

  return (
    <div
      className="rounded-2xl p-4"
      style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
    >
      <div className="flex gap-4 mb-3">
        <div
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl flex-shrink-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${thumb})`,
            backgroundColor: 'var(--border)',
          }}
        />
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate" style={{ fontSize: 15, color: 'var(--text)' }}>
            {channel.name}
          </p>
          <p className="caption truncate mt-0.5" style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
            {keywordsStr}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onRate('like')}
          className="flex-1 py-2.5 rounded-xl caption font-semibold transition active:opacity-90"
          style={{
            backgroundColor: rating === 'like' ? 'var(--emerald)' : 'var(--bg)',
            color: rating === 'like' ? '#fff' : 'var(--text-secondary)',
            border: rating === 'like' ? 'none' : '1px solid var(--border)',
          }}
        >
          좋아요
        </button>
        <button
          type="button"
          onClick={() => onRate('dislike')}
          className="flex-1 py-2.5 rounded-xl caption font-semibold transition active:opacity-90"
          style={{
            backgroundColor: rating === 'dislike' ? 'var(--accent-loss)' : 'var(--bg)',
            color: rating === 'dislike' ? '#fff' : 'var(--text-secondary)',
            border: rating === 'dislike' ? 'none' : '1px solid var(--border)',
          }}
        >
          관심없음
        </button>
        <button
          type="button"
          onClick={() => onRate('later')}
          className="flex-1 py-2.5 rounded-xl caption font-semibold transition active:opacity-90"
          style={{
            backgroundColor: rating === 'later' ? 'var(--royal-blue)' : 'var(--bg)',
            color: rating === 'later' ? '#fff' : 'var(--text-secondary)',
            border: rating === 'later' ? 'none' : '1px solid var(--border)',
          }}
        >
          나중에
        </button>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Heart, TrendingUp, Zap } from 'lucide-react';
import { getYtThumb } from '@/lib/thumbnails';

type RankItem = {
  id: string;
  title: string;
  creator_name?: string;
  thumbnail_url?: string;
  cnt?: number;
  progress?: number;
};

export default function RankingPage() {
  const [interest, setInterest] = useState<RankItem[]>([]);
  const [progress, setProgress] = useState<RankItem[]>([]);
  const [surge, setSurge] = useState<RankItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/ranking', { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        setInterest(json?.interest ?? []);
        setProgress(json?.progress ?? []);
        setSurge(json?.surge ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--toss-bg)' }}>
      <header className="sticky top-0 z-50 bg-[var(--toss-card)] border-b border-black/5">
        <div className="flex items-center h-14 px-4 max-w-lg mx-auto gap-2">
          <Link href="/" className="p-2 -ml-2 rounded-xl" style={{ color: 'var(--toss-text-secondary)' }} aria-label="뒤로">
            <ArrowLeft size={24} strokeWidth={2} />
          </Link>
          <h1 className="flex-1 text-center text-[17px] font-bold" style={{ color: 'var(--toss-text)' }}>랭킹</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4 pb-8 space-y-8">
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-2xl bg-black/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Heart size={20} style={{ color: 'var(--toss-blue)' }} />
                <h2 className="text-[17px] font-bold" style={{ color: 'var(--toss-text)' }}>관심 수 TOP10</h2>
              </div>
              <div className="space-y-2">
                {interest.map((item, i) => (
                  <RankRow key={item.id} rank={i + 1} item={item} extra={`${item.cnt ?? 0}관심`} />
                ))}
                {interest.length === 0 && <EmptyState />}
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={20} style={{ color: 'var(--toss-blue)' }} />
                <h2 className="text-[17px] font-bold" style={{ color: 'var(--toss-text)' }}>모집률 TOP10</h2>
              </div>
              <div className="space-y-2">
                {progress.map((item, i) => (
                  <RankRow key={item.id} rank={i + 1} item={item} extra={`${item.progress ?? 0}%`} />
                ))}
                {progress.length === 0 && <EmptyState />}
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <Zap size={20} style={{ color: 'var(--toss-blue)' }} />
                <h2 className="text-[17px] font-bold" style={{ color: 'var(--toss-text)' }}>최근 급상승 TOP10</h2>
              </div>
              <div className="space-y-2">
                {surge.map((item, i) => (
                  <RankRow key={item.id} rank={i + 1} item={item} />
                ))}
                {surge.length === 0 && <EmptyState />}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function RankRow({ rank, item, extra }: { rank: number; item: RankItem; extra?: string }) {
  const thumb = item.thumbnail_url ?? getYtThumb(rank - 1);
  return (
    <Link
      href={`/market/${item.id}`}
      className="flex items-center gap-3 p-3 rounded-xl border"
      style={{ backgroundColor: 'var(--toss-card)', borderColor: 'var(--toss-border)' }}
    >
      <span className="w-6 text-center text-[14px] font-bold" style={{ color: rank <= 3 ? 'var(--toss-blue)' : 'var(--toss-text-secondary)' }}>
        {rank}
      </span>
      <img src={thumb} alt="" className="w-12 h-12 rounded-lg object-cover" />
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-semibold truncate" style={{ color: 'var(--toss-text)' }}>{item.title}</div>
        {item.creator_name && (
          <div className="text-[12px] truncate" style={{ color: 'var(--toss-text-secondary)' }}>{item.creator_name}</div>
        )}
      </div>
      {extra && (
        <span className="text-[12px] font-medium shrink-0" style={{ color: 'var(--toss-blue)' }}>{extra}</span>
      )}
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="py-8 text-center text-[14px]" style={{ color: 'var(--toss-text-secondary)' }}>
      데이터가 없습니다.
    </div>
  );
}

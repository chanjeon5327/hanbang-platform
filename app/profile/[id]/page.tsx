'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User } from 'lucide-react';
import BottomNavigation from '@/components/home/BottomNavigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { useArtistContribution } from '@/hooks/useArtistContribution';
import { useArtistProgress } from '@/hooks/useArtistProgress';
import ArtistBadge from '@/components/profile/ArtistBadge';
import ArtistProgressCard from '@/components/profile/ArtistProgressCard';

type Profile = {
  id: string;
  nickname: string;
  avatar_url: string | null;
  display_name: string;
  role: string;
};

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { items: artistContributions } = useArtistContribution(!!user && user?.id === id);
  const { items: artistProgress } = useArtistProgress(!!user && user?.id === id);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/profile/${id}`)
      .then((res) => res.json())
      .then((json) => {
        if (json?.error) {
          setProfile({
            id,
            nickname: 'Unknown',
            avatar_url: null,
            display_name: '익명',
            role: 'USER',
          });
        } else {
          setProfile({
            id: json.id ?? id,
            nickname: json.nickname ?? 'Unknown',
            avatar_url: json.avatar_url ?? null,
            display_name: json.display_name ?? '익명',
            role: json.role ?? 'USER',
          });
        }
      })
      .catch(() => {
        setProfile({
          id,
          nickname: 'Unknown',
          avatar_url: null,
          display_name: '익명',
          role: 'USER',
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--toss-bg)' }}>
        <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b" style={{ backgroundColor: 'var(--toss-card)', borderColor: 'var(--toss-border)' }}>
          <button type="button" onClick={() => router.back()} className="p-2 -ml-2 rounded-lg hover:bg-black/5 transition" aria-label="뒤로">
            <ArrowLeft size={22} strokeWidth={2} style={{ color: 'var(--toss-text)' }} />
          </button>
          <span className="text-[18px] font-bold" style={{ color: 'var(--toss-text)' }}>프로필</span>
        </header>
        <main className="max-w-lg mx-auto px-4 py-8">
          <div className="h-32 w-32 rounded-full bg-black/10 animate-pulse mx-auto" />
          <div className="h-6 w-32 rounded bg-black/10 animate-pulse mx-auto mt-4" />
        </main>
        <BottomNavigation />
      </div>
    );
  }

  const p = profile ?? { id, nickname: 'Unknown', avatar_url: null, display_name: '익명', role: 'USER' };

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--toss-bg)' }}>
      <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b" style={{ backgroundColor: 'var(--toss-card)', borderColor: 'var(--toss-border)' }}>
        <button type="button" onClick={() => router.back()} className="p-2 -ml-2 rounded-lg hover:bg-black/5 transition" aria-label="뒤로">
          <ArrowLeft size={22} strokeWidth={2} style={{ color: 'var(--toss-text)' }} />
        </button>
        <span className="text-[18px] font-bold" style={{ color: 'var(--toss-text)' }}>프로필</span>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">
        <div className="flex flex-col items-center">
          {p.avatar_url ? (
            <img src={p.avatar_url} alt="" className="w-24 h-24 rounded-full object-cover" />
          ) : (
            <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--toss-border)' }}>
              <User size={40} style={{ color: 'var(--toss-text-secondary)' }} />
            </div>
          )}
          <h1 className="text-[20px] font-bold mt-4" style={{ color: 'var(--toss-text)' }}>{p.nickname}</h1>
          {p.role && p.role !== 'USER' && (
            <span className="text-[12px] mt-1 px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--toss-blue)', color: '#fff' }}>
              {p.role}
            </span>
          )}
        </div>

        <div className="mt-8 space-y-4">
          {user?.id === id && (artistContributions.length > 0 || artistProgress.length > 0) && (
            <section className="rounded-2xl p-4 border" style={{ backgroundColor: 'var(--toss-card)', borderColor: 'var(--toss-border)' }}>
              <h2 className="text-[15px] font-semibold mb-3" style={{ color: 'var(--toss-text)' }}>공식 파트너십</h2>
              {artistContributions.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 mb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {artistContributions.map((c) => (
                    <ArtistBadge key={c.artist_keyword} artist={c.artist_keyword} amount={c.total_amount} />
                  ))}
                </div>
              )}
              {artistProgress.length > 0 && (
                <div className="flex flex-col gap-3">
                  {artistProgress.map((p) => (
                    <ArtistProgressCard
                      key={p.artist_keyword}
                      artist={p.artist_keyword}
                      totalAmount={p.total_amount}
                      targetAmount={p.target_amount}
                      progress={p.progress_percent}
                    />
                  ))}
                </div>
              )}
            </section>
          )}
          <section className="rounded-2xl p-4 border" style={{ backgroundColor: 'var(--toss-card)', borderColor: 'var(--toss-border)' }}>
            <h2 className="text-[15px] font-semibold mb-2" style={{ color: 'var(--toss-text)' }}>최근 활동</h2>
            <p className="text-[13px]" style={{ color: 'var(--toss-text-secondary)' }}>준비 중입니다.</p>
          </section>
          <section className="rounded-2xl p-4 border" style={{ backgroundColor: 'var(--toss-card)', borderColor: 'var(--toss-border)' }}>
            <h2 className="text-[15px] font-semibold mb-2" style={{ color: 'var(--toss-text)' }}>관심작품</h2>
            <p className="text-[13px]" style={{ color: 'var(--toss-text-secondary)' }}>준비 중입니다.</p>
          </section>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}

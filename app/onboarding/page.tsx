'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const UPBIT = { bg: '#0d0d0d', panel: '#161616', border: '#2b2b2b', bid: '#1e88e5', text: '#e0e0e0', dim: '#8e8e8e' };

type Channel = { id: string; name: string; slug?: string; category?: string; thumbnail_url?: string | null };

export default function OnboardingPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/onboarding/channels', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { channels: [] }))
      .then((d) => setChannels(d.channels ?? []))
      .catch(() => setChannels([]))
      .finally(() => setLoading(false));
  }, []);

  const handleRate = async (channelId: string, score: number) => {
    setRatings((prev) => ({ ...prev, [channelId]: score }));
    await fetch('/api/onboarding/rate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel_id: channelId, score }),
    });
  };

  const handleComplete = async (skipped: boolean) => {
    setCompleting(true);
    try {
      const res = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skipped,
          summary: Object.keys(ratings).length > 0 ? { rated_count: Object.keys(ratings).length } : {},
        }),
      });
      if (res.ok) {
        router.replace('/');
      } else {
        const json = await res.json();
        alert(json.error ?? '완료 처리 실패');
      }
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen pb-24 flex items-center justify-center" style={{ backgroundColor: UPBIT.bg }}>
        <p style={{ color: UPBIT.dim }}>로딩 중…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-24" style={{ backgroundColor: UPBIT.bg }}>
      <header className="sticky top-0 z-50 border-b px-4 py-3 flex items-center justify-between" style={{ backgroundColor: UPBIT.bg, borderColor: UPBIT.border }}>
        <Link href="/" className="text-sm" style={{ color: UPBIT.dim }}>‹ 뒤로</Link>
        <span className="text-[12px] px-2 py-1 rounded" style={{ backgroundColor: UPBIT.panel, color: UPBIT.dim }}>취향 파악</span>
      </header>

      <div className="px-4 py-6">
        <div className="rounded-[12px] border p-4 mb-6" style={{ backgroundColor: UPBIT.panel, borderColor: UPBIT.border }}>
          <div className="flex gap-2 mb-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1 h-1 rounded-full" style={{ backgroundColor: s === 1 ? UPBIT.bid : UPBIT.border }} />
            ))}
          </div>
          <h1 className="text-[20px] font-bold mb-1" style={{ color: UPBIT.text }}>좋아하는 콘텐츠를 평가해주세요</h1>
          <p className="text-[13px]" style={{ color: UPBIT.dim }}>선택할수록 추천이 정확해집니다. 건너뛰기도 가능합니다.</p>
        </div>

        {channels.length > 0 ? (
          <div className="space-y-3 mb-8">
            {channels.map((ch, i) => (
              <div
                key={ch.id}
                className="rounded-xl p-4 border flex items-center gap-4"
                style={{ backgroundColor: UPBIT.panel, borderColor: UPBIT.border }}
              >
                <div
                  className="w-16 h-16 rounded-lg flex-shrink-0 bg-cover bg-center"
                  style={{ backgroundImage: ch.thumbnail_url ? `url(${ch.thumbnail_url})` : undefined, backgroundColor: ch.thumbnail_url ? 'transparent' : UPBIT.border }}
                >
                  {!ch.thumbnail_url && <span className="text-[10px] text-center flex items-center justify-center w-full h-full" style={{ color: UPBIT.dim }}>{ch.name.slice(0, 2)}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium truncate" style={{ color: UPBIT.text }}>{ch.name}</p>
                  <p className="text-[12px]" style={{ color: UPBIT.dim }}>{ch.category ?? '콘텐츠'}</p>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleRate(ch.id, s)}
                      className="w-8 h-8 rounded-full text-[12px] font-medium transition"
                      style={{
                        backgroundColor: (ratings[ch.id] ?? 0) >= s ? UPBIT.bid : UPBIT.border,
                        color: (ratings[ch.id] ?? 0) >= s ? '#fff' : UPBIT.dim,
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[14px] mb-6" style={{ color: UPBIT.dim }}>등록된 채널이 없습니다.</p>
        )}

        <div className="space-y-3">
          <button
            onClick={() => handleComplete(false)}
            disabled={completing}
            className="w-full py-3.5 rounded-lg text-white text-[16px] font-bold transition active:scale-[0.98] disabled:opacity-60"
            style={{ backgroundColor: UPBIT.bid }}
          >
            {completing ? '처리 중…' : '완료하고 시작하기'}
          </button>
          <button
            onClick={() => handleComplete(true)}
            disabled={completing}
            className="w-full py-3 rounded-lg text-[14px] transition"
            style={{ color: UPBIT.dim, border: `1px solid ${UPBIT.border}` }}
          >
            건너뛰기
          </button>
        </div>
      </div>
    </main>
  );
}

'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ChannelCard, { type Channel, type RatingType } from '@/components/onboarding/ChannelCard';
import { sanitizeRedirect } from '@/lib/auth/getPostLoginRoute';
import OnboardingSummary from '@/components/onboarding/OnboardingSummary';
import { getYtThumb } from '@/lib/thumbnails';

const MOCK_CHANNELS: (Channel & { keywords?: string })[] = [
  { id: 'm1', name: '여행가 제이', category: '여행', thumbnail_url: getYtThumb(0), keywords: '여행 · 브이로그 · 일상' },
  { id: 'm2', name: '음악의 시', category: '음악', thumbnail_url: getYtThumb(1), keywords: '음악 · 커버 · 라이브' },
  { id: 'm3', name: '패션 로드', category: '패션', thumbnail_url: getYtThumb(2), keywords: '패션 · 스타일 · OOTD' },
  { id: 'm4', name: '뷰티 이미지', category: '뷰티', thumbnail_url: getYtThumb(3), keywords: '뷰티 · 메이크업 · 스킨케어' },
  { id: 'm5', name: '스포츠 시즌', category: '스포츠', thumbnail_url: getYtThumb(4), keywords: '스포츠 · 하이라이트 · 분석' },
  { id: 'm6', name: '도서 리뷰', category: '도서', thumbnail_url: getYtThumb(5), keywords: '도서 · 리뷰 · 독서' },
  { id: 'm7', name: '영화 블록버스터', category: '영화', thumbnail_url: getYtThumb(0), keywords: '영화 · 리뷰 · 예고편' },
  { id: 'm8', name: '웹소설 드라마', category: '웹소설', thumbnail_url: getYtThumb(1), keywords: '웹소설 · 드라마 · 로맨스' },
  { id: 'm9', name: '팟캐스트 라이브', category: '팟캐스트', thumbnail_url: getYtThumb(2), keywords: '팟캐스트 · 토크 · 인터뷰' },
  { id: 'm10', name: '게임 플레이', category: '게임', thumbnail_url: getYtThumb(3), keywords: '게임 · 플레이 · 스트리밍' },
  { id: 'm11', name: '요리 클래스', category: '요리', thumbnail_url: getYtThumb(4), keywords: '요리 · 레시피 · 푸드' },
  { id: 'm12', name: '건강 다이어트', category: '건강', thumbnail_url: getYtThumb(5), keywords: '건강 · 다이어트 · 운동' },
  { id: 'm13', name: '테크 리뷰', category: '테크', thumbnail_url: getYtThumb(0), keywords: '테크 · 리뷰 · 가젯' },
  { id: 'm14', name: 'ASMR 힐링', category: 'ASMR', thumbnail_url: getYtThumb(1), keywords: 'ASMR · 힐링 · 수면' },
  { id: 'm15', name: 'Vlog 데일리', category: 'Vlog', thumbnail_url: getYtThumb(2), keywords: 'Vlog · 일상 · 브이로그' },
  { id: 'm16', name: '교육 강의', category: '교육', thumbnail_url: getYtThumb(3), keywords: '교육 · 강의 · 학습' },
  { id: 'm17', name: '재테크 투자', category: '재테크', thumbnail_url: getYtThumb(4), keywords: '재테크 · 투자 · 금융' },
  { id: 'm18', name: '반려동물', category: '반려동물', thumbnail_url: getYtThumb(5), keywords: '반려동물 · 펫 · 일상' },
  { id: 'm19', name: 'DIY 공예', category: '공예', thumbnail_url: getYtThumb(0), keywords: 'DIY · 공예 · 핸드메이드' },
  { id: 'm20', name: '자동차 리뷰', category: '자동차', thumbnail_url: getYtThumb(1), keywords: '자동차 · 리뷰 · 드라이브' },
];

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const ROUNDS = 3;
const CHANNELS_PER_ROUND = 10;

function OnboardingContent() {
  const [round, setRound] = useState(1);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [ratings, setRatings] = useState<Record<string, RatingType>>({});
  const [accumulatedCategories, setAccumulatedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [completedSkipped, setCompletedSkipped] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = sanitizeRedirect(searchParams.get('redirect') || '/');

  const currentLikedCategories = Object.entries(ratings)
    .filter(([, t]) => t === 'like')
    .map(([id]) => channels.find((c) => c.id === id)?.category)
    .filter((c): c is string => !!c);
  const uniqueCategories = [...new Set([...accumulatedCategories, ...currentLikedCategories])];

  const fetchChannels = useCallback(async (r: number, preferredCats: string[]) => {
    const params = new URLSearchParams();
    params.set('limit', String(CHANNELS_PER_ROUND));
    params.set('round', String(r));
    if (preferredCats.length > 0) params.set('categories', preferredCats.join(','));
    const res = await fetch(`/api/onboarding/channels?${params}`, { cache: 'no-store' });
    const data = await res.json().catch(() => ({}));
    return (data.channels ?? []) as Channel[];
  }, []);

  useEffect(() => {
    setLoading(true);
    const preferred = round === 1 ? [] : accumulatedCategories;
    fetchChannels(round, preferred)
      .then((list) => {
        if (list.length > 0) {
          setChannels(shuffle(list));
        } else {
          const pad = MOCK_CHANNELS.slice(0, CHANNELS_PER_ROUND);
          setChannels(shuffle(pad));
        }
      })
      .catch(() => setChannels(shuffle(MOCK_CHANNELS.slice(0, CHANNELS_PER_ROUND))))
      .finally(() => setLoading(false));
  }, [round, accumulatedCategories, fetchChannels]);

  const handleRate = async (channelId: string, type: RatingType) => {
    setRatings((prev) => ({ ...prev, [channelId]: type }));
    if (type === 'later') return;
    const score = type === 'like' ? 5 : 1;
    try {
      await fetch('/api/onboarding/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel_id: channelId, score }),
      });
    } catch {
      // API 실패해도 UI 유지
    }
  };

  const handleNextRound = () => {
    if (round < ROUNDS) {
      const newCats = Object.entries(ratings)
        .filter(([, t]) => t === 'like')
        .map(([id]) => channels.find((c) => c.id === id)?.category)
        .filter((c): c is string => !!c);
      setAccumulatedCategories((prev) => [...new Set([...prev, ...newCats])]);
      setRound((r) => r + 1);
      setRatings({});
    }
  };

  const handleComplete = async (skipped: boolean) => {
    setCompleting(true);
    setCompletedSkipped(skipped);
    try {
      const likedIds = Object.entries(ratings)
        .filter(([, t]) => t === 'like')
        .map(([id]) => id);
      const currentRoundCats = likedIds
        .map((id) => channels.find((c) => c.id === id)?.category)
        .filter((c): c is string => !!c);
      const allCategories = [...new Set([...accumulatedCategories, ...currentRoundCats])];

      await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skipped,
          summary: {
            rated_count: allCategories.length,
            preferred_categories: allCategories,
            round_completed: round,
          },
        }),
      });
      setShowSummary(true);
      const target = redirectParam.startsWith('/') ? redirectParam : '/';
      setTimeout(() => router.replace(target), 2000);
    } catch {
      setShowSummary(true);
      const target = redirectParam.startsWith('/') ? redirectParam : '/';
      setTimeout(() => router.replace(target), 2000);
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-24" style={{ backgroundColor: 'var(--bg)' }}>
        <p className="body-sm" style={{ color: 'var(--text-secondary)' }}>
          로딩 중…
        </p>
      </div>
    );
  }

  if (showSummary) {
    const ratedCount = Object.keys(ratings).filter((k) => ratings[k] === 'like').length;
    return (
      <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--bg)' }}>
        <OnboardingSummary ratedCount={ratedCount} skipped={completedSkipped} />
        <p className="text-center caption" style={{ color: 'var(--text-secondary)' }}>
          {redirectParam === '/' ? '홈으로 이동합니다…' : '이동합니다…'}
        </p>
      </div>
    );
  }

  const channelsToShow = channels.length > 0 ? channels : shuffle(MOCK_CHANNELS).slice(0, CHANNELS_PER_ROUND);
  const canComplete = round === ROUNDS;

  return (
    <div className="pb-24" style={{ backgroundColor: 'var(--bg)' }}>
      <header
        className="sticky top-0 z-50 border-b px-4 py-3 flex items-center justify-between"
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <Link href="/" className="body-sm" style={{ color: 'var(--text-secondary)' }}>
          ‹ 뒤로
        </Link>
        <span
          className="px-2 py-1 rounded-full caption"
          style={{ backgroundColor: 'var(--bg)', color: 'var(--text-secondary)' }}
        >
          {round}/{ROUNDS} 라운드
        </span>
      </header>

      <div className="px-4 py-6 max-w-[480px] mx-auto">
        <div
          className="rounded-2xl p-4 mb-6"
          style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <h1 className="font-bold mb-1" style={{ fontSize: 18, color: 'var(--text)' }}>
            {round === 1
              ? '좋아하는 콘텐츠를 골라주세요'
              : round === 2
                ? '비슷한 콘텐츠를 더 골라주세요'
                : '마지막으로 골라주세요'}
          </h1>
          <p className="caption" style={{ color: 'var(--text-secondary)' }}>
            선택할수록 추천이 정확해집니다. 건너뛰기도 가능합니다.
          </p>
        </div>

        <div className="space-y-3 mb-8 max-h-[55vh] overflow-y-auto no-scrollbar">
          {channelsToShow.map((ch, i) => (
            <ChannelCard
              key={`${round}-${ch.id}`}
              channel={ch}
              index={i}
              rating={ratings[ch.id] ?? null}
              onRate={(type) => handleRate(ch.id, type)}
            />
          ))}
        </div>

        <div className="space-y-3">
          {canComplete ? (
            <>
              <button
                type="button"
                onClick={() => handleComplete(false)}
                disabled={completing}
                className="w-full py-3.5 rounded-2xl font-semibold text-white transition active:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: 'var(--royal-blue)', fontSize: 15 }}
              >
                {completing ? '처리 중…' : '완료하고 시작하기'}
              </button>
              <button
                type="button"
                onClick={() => handleComplete(true)}
                disabled={completing}
                className="w-full py-3 rounded-2xl body-sm transition"
                style={{
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                }}
              >
                건너뛰기
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleNextRound}
              className="w-full py-3.5 rounded-2xl font-semibold text-white transition active:opacity-90"
              style={{ backgroundColor: 'var(--royal-blue)', fontSize: 15 }}
            >
              다음 라운드 ({round + 1}/{ROUNDS})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center pb-24" style={{ backgroundColor: 'var(--bg)' }}>
          <p className="body-sm" style={{ color: 'var(--text-secondary)' }}>로딩 중…</p>
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}

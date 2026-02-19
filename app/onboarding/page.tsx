'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ChannelCard, { type Channel, type RatingType } from '@/components/onboarding/ChannelCard';
import OnboardingSummary from '@/components/onboarding/OnboardingSummary';
import { getYtThumb } from '@/lib/thumbnails';

const MOCK_CHANNELS: Channel[] = [
  { id: 'm1', name: '여행가 제이', category: '여행', thumbnail_url: getYtThumb(0) },
  { id: 'm2', name: '음악의 시', category: '음악', thumbnail_url: getYtThumb(1) },
  { id: 'm3', name: '패션 로드', category: '패션', thumbnail_url: getYtThumb(2) },
  { id: 'm4', name: '뷰티 이미지', category: '뷰티', thumbnail_url: getYtThumb(3) },
  { id: 'm5', name: '스포츠 시즌', category: '스포츠', thumbnail_url: getYtThumb(4) },
  { id: 'm6', name: '도서 리뷰', category: '도서', thumbnail_url: getYtThumb(5) },
  { id: 'm7', name: '영화 블록버스터', category: '영화', thumbnail_url: getYtThumb(0) },
  { id: 'm8', name: '웹소설 드라마', category: '웹소설', thumbnail_url: getYtThumb(1) },
  { id: 'm9', name: '팟캐스트 라이브', category: '팟캐스트', thumbnail_url: getYtThumb(2) },
  { id: 'm10', name: '게임 플레이', category: '게임', thumbnail_url: getYtThumb(3) },
  { id: 'm11', name: '요리 클래스', category: '요리', thumbnail_url: getYtThumb(4) },
  { id: 'm12', name: '건강 다이어트', category: '건강', thumbnail_url: getYtThumb(5) },
  { id: 'm13', name: '테크 리뷰', category: '테크', thumbnail_url: getYtThumb(0) },
  { id: 'm14', name: 'ASMR 힐링', category: 'ASMR', thumbnail_url: getYtThumb(1) },
  { id: 'm15', name: 'Vlog 데일리', category: 'Vlog', thumbnail_url: getYtThumb(2) },
  { id: 'm16', name: '교육 강의', category: '교육', thumbnail_url: getYtThumb(3) },
  { id: 'm17', name: '재테크 투자', category: '재테크', thumbnail_url: getYtThumb(4) },
  { id: 'm18', name: '반려동물', category: '반려동물', thumbnail_url: getYtThumb(5) },
  { id: 'm19', name: 'DIY 공예', category: '공예', thumbnail_url: getYtThumb(0) },
  { id: 'm20', name: '자동차 리뷰', category: '자동차', thumbnail_url: getYtThumb(1) },
  { id: 'm21', name: '부동산 정보', category: '부동산', thumbnail_url: getYtThumb(2) },
  { id: 'm22', name: '캠핑 아웃도어', category: '아웃도어', thumbnail_url: getYtThumb(3) },
  { id: 'm23', name: '맛집 탐방', category: '맛집', thumbnail_url: getYtThumb(4) },
  { id: 'm24', name: '댄스 커버', category: '댄스', thumbnail_url: getYtThumb(5) },
  { id: 'm25', name: '코딩 튜토리얼', category: '개발', thumbnail_url: getYtThumb(0) },
  { id: 'm26', name: '일상 브이로그', category: '일상', thumbnail_url: getYtThumb(1) },
  { id: 'm27', name: '인터뷰 토크', category: '토크', thumbnail_url: getYtThumb(2) },
  { id: 'm28', name: '드로잉 아트', category: '아트', thumbnail_url: getYtThumb(3) },
  { id: 'm29', name: '사진 편집', category: '사진', thumbnail_url: getYtThumb(4) },
  { id: 'm30', name: '영어 회화', category: '언어', thumbnail_url: getYtThumb(5) },
  { id: 'm31', name: '힙합 랩', category: '힙합', thumbnail_url: getYtThumb(0) },
  { id: 'm32', name: '인디 음악', category: '인디', thumbnail_url: getYtThumb(1) },
  { id: 'm33', name: '클래식 음악', category: '클래식', thumbnail_url: getYtThumb(2) },
  { id: 'm34', name: 'K-POP 커버', category: 'K-POP', thumbnail_url: getYtThumb(3) },
  { id: 'm35', name: '재즈 라이브', category: '재즈', thumbnail_url: getYtThumb(4) },
  { id: 'm36', name: '일본 드라마', category: '일드', thumbnail_url: getYtThumb(5) },
  { id: 'm37', name: '애니 리뷰', category: '애니', thumbnail_url: getYtThumb(0) },
  { id: 'm38', name: '웹툰 리뷰', category: '웹툰', thumbnail_url: getYtThumb(1) },
  { id: 'm39', name: '시사 해설', category: '시사', thumbnail_url: getYtThumb(2) },
  { id: 'm40', name: '과학 실험', category: '과학', thumbnail_url: getYtThumb(3) },
  { id: 'm41', name: '역사 다큐', category: '역사', thumbnail_url: getYtThumb(4) },
  { id: 'm42', name: '심리학 강의', category: '심리', thumbnail_url: getYtThumb(5) },
  { id: 'm43', name: '명상 힐링', category: '명상', thumbnail_url: getYtThumb(0) },
  { id: 'm44', name: '요가 스트레칭', category: '요가', thumbnail_url: getYtThumb(1) },
  { id: 'm45', name: '러닝 마라톤', category: '러닝', thumbnail_url: getYtThumb(2) },
  { id: 'm46', name: '골프 레슨', category: '골프', thumbnail_url: getYtThumb(3) },
  { id: 'm47', name: '등산 트레킹', category: '등산', thumbnail_url: getYtThumb(4) },
  { id: 'm48', name: '수영 강습', category: '수영', thumbnail_url: getYtThumb(5) },
  { id: 'm49', name: '피트니스 홈트', category: '피트니스', thumbnail_url: getYtThumb(0) },
  { id: 'm50', name: '크리에이터 스토리', category: '스토리', thumbnail_url: getYtThumb(1) },
];

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export default function OnboardingPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [ratings, setRatings] = useState<Record<string, RatingType>>({});
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [completedSkipped, setCompletedSkipped] = useState(false);
  const router = useRouter();

  const displayChannels = useMemo(() => {
    const need = Math.max(0, 50 - channels.length);
    const pad = MOCK_CHANNELS.slice(0, need);
    const list = [...channels, ...pad].slice(0, 50);
    return shuffle(list);
  }, [channels]);

  useEffect(() => {
    fetch('/api/onboarding/channels', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { channels: [] }))
      .then((d) => setChannels(d.channels ?? []))
      .catch(() => setChannels([]))
      .finally(() => setLoading(false));
  }, []);

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
      // 데모: API 실패해도 UI 유지
    }
  };

  const handleComplete = async (skipped: boolean) => {
    setCompleting(true);
    setCompletedSkipped(skipped);
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
        setShowSummary(true);
        setTimeout(() => router.replace('/'), 2000);
      } else {
        setShowSummary(true);
        setTimeout(() => router.replace('/'), 2000);
      }
    } catch {
      setShowSummary(true);
      setTimeout(() => router.replace('/'), 2000);
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
    const ratedCount = Object.keys(ratings).filter((k) => ratings[k] !== 'later').length;
    return (
      <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--bg)' }}>
        <OnboardingSummary ratedCount={ratedCount} skipped={completedSkipped} />
        <p className="text-center caption" style={{ color: 'var(--text-secondary)' }}>
          홈으로 이동합니다…
        </p>
      </div>
    );
  }

  const channelsToShow = displayChannels.length > 0 ? displayChannels : MOCK_CHANNELS;

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
          취향 파악
        </span>
      </header>

      <div className="px-4 py-6 max-w-[480px] mx-auto">
        <div
          className="rounded-2xl p-4 mb-6"
          style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <h1 className="font-bold mb-1" style={{ fontSize: 18, color: 'var(--text)' }}>
            좋아하는 콘텐츠를 평가해주세요
          </h1>
          <p className="caption" style={{ color: 'var(--text-secondary)' }}>
            선택할수록 추천이 정확해집니다. 건너뛰기도 가능합니다.
          </p>
        </div>

        <div className="space-y-3 mb-8 max-h-[60vh] overflow-y-auto no-scrollbar">
          {channelsToShow.map((ch, i) => (
            <ChannelCard
              key={ch.id}
              channel={ch}
              index={i}
              rating={ratings[ch.id] ?? null}
              onRate={(type) => handleRate(ch.id, type)}
            />
          ))}
        </div>

        <div className="space-y-3">
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
        </div>
      </div>
    </div>
  );
}

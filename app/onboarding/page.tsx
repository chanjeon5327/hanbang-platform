'use client';

import InterestRail from '@/components/interest/InterestRail';
import { useUserTaste } from '@/stores/userTaste';
import { useRouter } from 'next/navigation';

const items = Array.from({ length: 12 }).map((_, i) => ({
  id: String(i),
  title:
    i % 2
      ? '유튜브 <여행가 제이>'
      : '전지적 독자 시점 웹툰',
  subtitle: i % 2 ? '여행 / 브이로그' : '웹툰 / IP',
  thumbUrl:
    'https://images.unsplash.com/photo-1526481280695-3c687fd5432c?auto=format&fit=crop&w=800&q=70',
}));

export default function OnboardingPage() {
  const rate = useUserTaste((s) => s.rate);
  const router = useRouter();

  const handleRate = (id: string, score: number) => {
    rate(id, score);
  };

  return (
    <main className="min-h-screen bg-[var(--bg-app)]">
      <div className="mx-auto max-w-[520px] py-4">
        <div className="px-4 mb-3">
          <h1 className="text-[20px] font-extrabold">
            좋아하는 콘텐츠를 평가해주세요
          </h1>
          <p className="text-[13px] text-black/55">
            선택할수록 추천이 정확해집니다
          </p>
        </div>

        <InterestRail
          title="관심 가는 콘텐츠"
          items={items}
          mode="onboarding"
          onRate={handleRate}
        />

        <div className="px-4 mt-6">
          <button
            onClick={() => router.push('/')}
            className="
              w-full rounded-xl
              bg-black text-white
              py-3 text-[15px] font-bold
              active:scale-[0.98]
            "
          >
            홈으로 이동
          </button>
        </div>
      </div>
    </main>
  );
}

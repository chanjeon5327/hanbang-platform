'use client';

import InterestRail from '@/components/interest/InterestRail';
import { useUserTaste } from '@/stores/userTaste';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

/* 업비트 사용법 레퍼런스: 단계형 스텝퍼 + CTA */
const UPBIT = { bg: '#0d0d0d', panel: '#161616', border: '#2b2b2b', bid: '#1e88e5', text: '#e0e0e0', dim: '#8e8e8e' };

const items = Array.from({ length: 12 }).map((_, i) => ({
  id: String(i),
  title: i % 2 ? '유튜브 <여행가 제이>' : '전지적 독자 시점 웹툰',
  subtitle: i % 2 ? '여행 / 브이로그' : '웹툰 / IP',
  thumbUrl: 'https://images.unsplash.com/photo-1526481280695-3c687fd5432c?auto=format&fit=crop&w=800&q=70',
}));

export default function OnboardingPage() {
  const rate = useUserTaste((s) => s.rate);
  const router = useRouter();

  const handleRate = (id: string, score: number) => {
    rate(id, score);
  };

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
          <p className="text-[13px]" style={{ color: UPBIT.dim }}>선택할수록 추천이 정확해집니다</p>
        </div>

        <InterestRail title="관심 가는 콘텐츠" items={items} mode="onboarding" onRate={handleRate} />

        <div className="mt-8">
          <button
            onClick={() => router.push('/')}
            className="w-full py-3.5 rounded-lg text-white text-[16px] font-bold transition active:scale-[0.98]"
            style={{ backgroundColor: UPBIT.bid }}
          >
            홈으로 이동
          </button>
        </div>
      </div>
    </main>
  );
}

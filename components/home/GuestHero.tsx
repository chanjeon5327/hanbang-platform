'use client';

import Link from 'next/link';
import { Compass, PlayCircle } from 'lucide-react';

/** 비로그인: 엔젤 투자 한 줄 카피 + CTA 2개 - 3초 설득 */
export default function GuestHero() {
  return (
    <section
      className="rounded-[16px] p-6 border overflow-hidden card-royal"
      style={{
        background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #3B82F6 100%)',
        borderColor: 'rgba(255,255,255,0.2)',
        boxShadow: 'var(--shadow-royal)',
      }}
    >
      <h2 className="text-[18px] font-bold leading-tight text-white">
        엔젤 투자, 3초 만에 시작하세요
      </h2>
      <p className="text-[14px] mt-1 text-white/90">
        배당형 IP 수익권으로 예상 배당 수익률을 누리세요.
      </p>

      <div className="grid grid-cols-2 gap-3 mt-4" data-testid="guest-cta-area">
        <Link
          href="/market"
          className="rounded-xl py-3 px-4 flex items-center gap-2.5 tap-scale focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2"
          style={{ backgroundColor: 'var(--card)', color: 'var(--royal-blue)', boxShadow: 'var(--shadow-md)' }}
        >
          <Compass size={22} strokeWidth={2} aria-hidden />
          <span className="text-[14px] font-bold">구경하기</span>
        </Link>
        <Link
          href="/demo"
          className="rounded-xl py-3 px-4 flex items-center gap-2.5 tap-scale border-2 border-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2"
          style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'var(--card)' }}
        >
          <PlayCircle size={22} strokeWidth={2} aria-hidden />
          <span className="text-[14px] font-bold">데모</span>
        </Link>
      </div>
    </section>
  );
}

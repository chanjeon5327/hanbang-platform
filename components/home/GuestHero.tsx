'use client';

import Link from 'next/link';
import { Compass, PlayCircle } from 'lucide-react';

const TOSS = { blue: '#3182f6', card: '#ffffff', text: '#191f28', secondary: '#6b7684' } as const;

/** 비로그인: 한 줄 카피 + CTA 2개 (구경하기/데모) - 3초 설득 */
export default function GuestHero() {
  return (
    <section
      className="rounded-2xl p-6 border overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #3182f6 0%, #6366f1 100%)',
        borderColor: 'rgba(255,255,255,0.2)',
        boxShadow: '0 4px 20px rgba(49,130,246,0.35)',
      }}
    >
      <h2 className="text-[18px] font-bold leading-tight text-white">
        디지털 IP 수익권, 3초 만에 시작하세요
      </h2>
      <p className="text-[14px] mt-1 text-white/90">
        유튜브·웹툰·음원 수익을 조각으로 투자하고 수익을 나눕니다.
      </p>

      <div className="grid grid-cols-2 gap-3 mt-4" data-testid="guest-cta-area">
        <Link
          href="/market"
          className="rounded-xl py-3 px-4 flex items-center gap-2.5 transition active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2"
          style={{ backgroundColor: TOSS.card, color: TOSS.blue, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
        >
          <Compass size={22} strokeWidth={2} aria-hidden />
          <span className="text-[14px] font-bold">구경하기</span>
        </Link>
        <Link
          href="/demo"
          className="rounded-xl py-3 px-4 flex items-center gap-2.5 transition active:scale-[0.98] border-2 border-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2"
          style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: TOSS.card }}
        >
          <PlayCircle size={22} strokeWidth={2} aria-hidden />
          <span className="text-[14px] font-bold">데모</span>
        </Link>
      </div>
    </section>
  );
}

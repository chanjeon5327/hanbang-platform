'use client';

import Link from 'next/link';
import { Compass, PlayCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/** 비로그인: 투자 한 줄 카피 + CTA 2개 - 3초 설득 */
export default function GuestHero() {
  return (
    <Card
      className="overflow-hidden card-royal hero-glow p-6 border"
      style={{ borderColor: 'rgba(255,255,255,0.2)' }}
    >
      <h2 className="body-lg font-bold tracking-tight leading-tight text-white text-display">
        투자, 3초 만에 시작하세요
      </h2>
      <p className="body-sm mt-1 text-white/90 text-subtitle opacity-90">
        배당형 IP 수익권으로 예상 배당 수익률을 누리세요.
      </p>

      <div className="grid grid-cols-2 gap-3 mt-4" data-testid="guest-cta-area">
        <Button asChild variant="default" size="lg" className="w-full transition-opacity duration-200 hover:opacity-95 bg-white text-[var(--royal-blue)] hover:bg-white/90">
          <Link
            href="/market"
            className="flex items-center justify-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2"
          >
            <Compass size={22} strokeWidth={2} aria-hidden />
            <span className="body-sm font-bold">구경하기</span>
          </Link>
        </Button>
        <Button asChild variant="secondary" size="default" className="border-2 border-white/40 text-white hover:bg-white/10">
          <Link
            href="/demo"
            className="flex items-center justify-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
          >
            <PlayCircle size={22} strokeWidth={2} aria-hidden />
            <span className="body-sm font-bold">데모</span>
          </Link>
        </Button>
      </div>
    </Card>
  );
}

'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import BottomNavigation from '@/components/home/BottomNavigation';

export default function SupportInquiryPage() {
  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--toss-bg)' }}>
      <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b" style={{ backgroundColor: 'var(--toss-card)', borderColor: 'var(--toss-border)' }}>
        <Link href="/" className="p-2 -ml-2 rounded-lg hover:bg-black/5 transition" aria-label="뒤로">
          <ArrowLeft size={22} strokeWidth={2} style={{ color: 'var(--toss-text)' }} />
        </Link>
        <h1 className="text-[18px] font-bold" style={{ color: 'var(--toss-text)' }}>문의하기</h1>
      </header>
      <main className="max-w-lg mx-auto px-4 py-6">
        <p className="text-[14px]" style={{ color: 'var(--toss-text-secondary)' }}>
          연락처: 010-2164-7327 · 카톡: jbc01 · 이메일: jbc001@nate.com
        </p>
      </main>
      <BottomNavigation />
    </div>
  );
}

'use client';

import Link from 'next/link';
import { signOutAndCleanup } from '@/lib/auth/signOut';

export default function MyPageLayout({ children }: { children: React.ReactNode }) {
  async function handleLogout() {
    await signOutAndCleanup('/');
  }

  return (
    <div className="bg-[var(--toss-bg)] pb-20" data-testid="mypage">
      <header className="h-12 px-4 flex items-center justify-between border-b border-[var(--toss-border)] bg-white">
        <h1 className="text-[16px] font-bold text-[var(--toss-text)]">마이페이지</h1>
        <button
          type="button"
          onClick={handleLogout}
          className="text-[13px] font-medium text-[var(--toss-text-secondary)] hover:text-[var(--toss-text)] transition"
        >
          로그아웃
        </button>
      </header>
      <div className="py-4 space-y-4">{children}</div>
    </div>
  );
}

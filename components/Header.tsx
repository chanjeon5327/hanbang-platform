'use client';

import Link from 'next/link';
import { Moon, Sun, Search, User, LogOut, LogIn } from 'lucide-react';
import NotificationBell from '@/components/notifications/NotificationBell';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/components/auth/AuthProvider';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, loading, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-[var(--toss-card)] border-b border-black/5">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-[20px] font-black tracking-tight text-[var(--toss-text)]">HANBANG</span>
          <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white bg-[var(--toss-blue)]">베타</span>
        </Link>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2.5 rounded-xl text-[var(--toss-text-secondary)] hover:bg-[var(--toss-bg)] transition focus:outline-none focus:ring-2 focus:ring-[var(--toss-blue)] focus:ring-offset-1"
            aria-label={theme === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
            title={theme === 'light' ? '다크' : '라이트'}
          >
            {theme === 'light' ? <Moon size={22} strokeWidth={2} /> : <Sun size={22} strokeWidth={2} />}
          </button>
          <Link href="/" className="p-2.5 rounded-xl text-[var(--toss-text-secondary)] hover:bg-[var(--toss-bg)] transition focus:outline-none focus:ring-2 focus:ring-[var(--toss-blue)] focus:ring-offset-1" aria-label="검색"><Search size={22} strokeWidth={2} /></Link>
          <NotificationBell />
          {loading ? (
            <span className="p-2.5 rounded-xl text-[var(--toss-text-secondary)] animate-pulse" aria-hidden>⋯</span>
          ) : user ? (
            <>
              <Link href="/mypage" className="p-2.5 rounded-xl text-[var(--toss-text-secondary)] hover:bg-[var(--toss-bg)] hover:text-[var(--toss-blue)] transition focus:outline-none focus:ring-2 focus:ring-[var(--toss-blue)] focus:ring-offset-1" aria-label="마이페이지"><User size={22} strokeWidth={2} /></Link>
              <button
                type="button"
                onClick={signOut}
                className="p-2.5 rounded-xl text-[var(--toss-text-secondary)] hover:bg-[var(--toss-bg)] transition focus:outline-none focus:ring-2 focus:ring-[var(--toss-blue)] focus:ring-offset-1"
                aria-label="로그아웃"
                title="로그아웃"
              >
                <LogOut size={22} strokeWidth={2} />
              </button>
            </>
          ) : (
            <Link href="/login" className="p-2.5 rounded-xl text-[var(--toss-text-secondary)] hover:bg-[var(--toss-bg)] transition focus:outline-none focus:ring-2 focus:ring-[var(--toss-blue)] focus:ring-offset-1" aria-label="로그인"><LogIn size={22} strokeWidth={2} /></Link>
          )}
        </div>
      </div>
    </header>
  );
}

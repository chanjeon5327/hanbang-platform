'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useTheme } from '@/context/ThemeContext';

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (mounted) setUser(data.session?.user ?? null);
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setUser(session?.user ?? null);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    const supabase = createClient();
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (e) {
      console.error('로그아웃 실패:', e);
    }
  };

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
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <Link href="/" className="p-2.5 rounded-xl text-[var(--toss-text-secondary)] hover:bg-[var(--toss-bg)] transition focus:outline-none focus:ring-2 focus:ring-[var(--toss-blue)] focus:ring-offset-1" aria-label="검색">🔍</Link>
          <button type="button" className="p-2.5 rounded-xl text-[var(--toss-text-secondary)] hover:bg-[var(--toss-bg)] transition focus:outline-none focus:ring-2 focus:ring-[var(--toss-blue)] focus:ring-offset-1" aria-label="알림">🔔</button>
          {loading ? (
            <span className="p-2.5 rounded-xl text-[var(--toss-text-secondary)] animate-pulse" aria-hidden>⋯</span>
          ) : user ? (
            <>
              <Link href="/mypage" className="p-2.5 rounded-xl text-[var(--toss-text-secondary)] hover:bg-[var(--toss-bg)] hover:text-[var(--toss-blue)] transition focus:outline-none focus:ring-2 focus:ring-[var(--toss-blue)] focus:ring-offset-1" aria-label="마이페이지">👤</Link>
              <button
                type="button"
                onClick={handleLogout}
                className="p-2.5 rounded-xl text-[var(--toss-text-secondary)] hover:bg-[var(--toss-bg)] transition focus:outline-none focus:ring-2 focus:ring-[var(--toss-blue)] focus:ring-offset-1"
                aria-label="로그아웃"
                title="로그아웃"
              >
                🚪
              </button>
            </>
          ) : (
            <Link href="/login" className="p-2.5 rounded-xl text-[var(--toss-text-secondary)] hover:bg-[var(--toss-bg)] transition focus:outline-none focus:ring-2 focus:ring-[var(--toss-blue)] focus:ring-offset-1" aria-label="로그인">🔐</Link>
          )}
        </div>
      </div>
    </header>
  );
}

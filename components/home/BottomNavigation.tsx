'use client';

import Link from 'next/link';
import { Home, LogIn, TrendingUp, Wallet, Trophy, User } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

const navItems = [
  { href: '/', label: '홈', Icon: Home },
  { href: '/active-invest', label: '투자', Icon: TrendingUp },
  { href: '/wallet', label: '지갑', Icon: Wallet, primary: true },
  { href: '/ranking', label: '랭킹', Icon: Trophy },
  { href: '/mypage', label: '마이', Icon: User },
];

const demoNavItems = [
  { href: '/demo', label: '홈', Icon: Home, primary: true },
  { href: '/market', label: '둘러보기', Icon: TrendingUp },
  { href: '#login', label: '로그인', Icon: LogIn, openModal: true },
];

export default function BottomNavigation({ demoMode }: { demoMode?: boolean }) {
  const { openLoginModal } = useAuth();
  const items = demoMode ? demoNavItems : navItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 flex justify-around items-center bg-[var(--toss-card)] border-t border-black/5" aria-label="주 메뉴">
      {items.map((item) => {
        const isLoginModal = 'openModal' in item && item.openModal;
        if (isLoginModal) {
          return (
            <button
              key={item.href}
              type="button"
              onClick={openLoginModal}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2 caption font-medium transition"
              style={{ color: item.primary ? 'var(--toss-blue)' : 'var(--toss-text-secondary)' }}
              aria-label={item.label}
            >
              <item.Icon size={24} strokeWidth={1.8} className="mb-0.5" />
              <span>{item.label}</span>
            </button>
          );
        }
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2 caption font-medium transition"
            style={{ color: item.primary ? 'var(--toss-blue)' : 'var(--toss-text-secondary)' }}
            aria-label={item.label}
          >
            <item.Icon size={24} strokeWidth={1.8} className="mb-0.5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

'use client';

import Link from 'next/link';

const navItems = [
  { href: '/', label: '홈', icon: '🏠' },
  { href: '/active-invest', label: '투자', icon: '📈' },
  { href: '/wallet', label: '지갑', icon: '💰', primary: true },
  { href: '/ranking', label: '랭킹', icon: '🏆' },
  { href: '/mypage', label: '마이', icon: '👤' },
];

export default function BottomNavigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 flex justify-around items-center bg-[var(--toss-card)] border-t border-black/5" aria-label="주 메뉴">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-[11px] font-medium transition"
          style={{ color: item.primary ? 'var(--toss-blue)' : 'var(--toss-text-secondary)' }}
          aria-label={item.label}
        >
          <span className="text-[18px] leading-none">{item.icon}</span>
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

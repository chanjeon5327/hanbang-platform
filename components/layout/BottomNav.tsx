'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, TrendingUp, Play, MessageCircle, ShoppingBag, User } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/',        label: '홈',      Icon: Home },
  { href: '/market',  label: '마켓',    Icon: TrendingUp },
  { href: '/content', label: '콘텐츠',  Icon: Play },
  { href: '/lounge',  label: '라운지',  Icon: MessageCircle },
  { href: '/goods',   label: '굿즈',    Icon: ShoppingBag },
  { href: '/mypage',  label: '마이',    Icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 h-16 flex justify-around items-center z-[200]"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        backgroundColor: 'var(--hb-card, var(--toss-card))',
        borderTop: '1px solid var(--hb-border, rgba(0,0,0,0.08))',
      }}
      aria-label="주 메뉴"
    >
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const isActive =
          href === '/'
            ? pathname === '/'
            : pathname === href || pathname.startsWith(href + '/');
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-xs font-medium transition"
            style={{
              color: isActive ? 'var(--hb-primary, var(--toss-blue))' : 'var(--hb-muted, var(--toss-text-secondary))',
            }}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 1.8} className="mb-0.5" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

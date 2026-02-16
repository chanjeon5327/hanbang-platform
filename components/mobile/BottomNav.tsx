'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Trophy, TrendingUp, Wallet, LayoutGrid } from 'lucide-react';

const menus = [
  { id: '홈', Icon: Home, href: '/' },
  { id: '랭킹', Icon: Trophy, href: '/ranking' },
  { id: '투자', Icon: TrendingUp, href: '/active-invest' },
  { id: '지갑', Icon: Wallet, href: '/wallet' },
  { id: '전체', Icon: LayoutGrid, href: '/market' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 w-full h-[70px] bg-white border-t border-gray-200 flex justify-around items-center z-50 pb-safe">
      {menus.map((menu) => {
        const isActive = pathname === menu.href || (menu.href === '/' && pathname === '/');
        return (
          <Link
            key={menu.id}
            href={menu.href}
            className="flex flex-col items-center justify-center w-full h-full btn-press"
          >
            <menu.Icon size={26} strokeWidth={2} className="mb-1" />
            <span
              className={`caption font-medium ${
                isActive ? 'text-black' : 'text-gray-300'
              }`}
            >
              {menu.id}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

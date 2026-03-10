'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import HeaderAuthSlot from '@/components/layout/HeaderAuthSlot';

export default function AppHeader() {
  const pathname = usePathname();
  const isLogin = pathname === '/login';

  if (isLogin) {
    return (
      <header
        className="z-[200]"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 64,
          backgroundColor: 'var(--legacy-bg)',
          borderBottom: '1px solid var(--legacy-border)',
        }}
      >
        <div className="flex items-center justify-between h-full px-4 max-w-[1320px] mx-auto">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="font-black text-xl tracking-tight" style={{ color: 'var(--legacy-text)' }}>
              HANBANG
            </span>
            <span
              className="rounded-full px-2.5 py-1 text-xs font-bold"
              style={{ backgroundColor: 'var(--legacy-pill-bg)', color: 'var(--legacy-pill-text)' }}
            >
              베타
            </span>
          </Link>
          <HeaderAuthSlot />
        </div>
      </header>
    );
  }

  return (
    <header
      className="border-b z-[200]"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 64,
        backgroundColor: 'var(--hb-card, var(--toss-card))',
        borderColor: 'var(--hb-border, rgba(0,0,0,0.05))',
      }}
    >
      <div className="flex items-center justify-between h-full px-4 max-w-[1320px] mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <span className="h3 font-black tracking-tight" style={{ color: 'var(--hb-text, var(--toss-text))' }}>
            HANBANG
          </span>
          <span
            className="rounded-full px-2 py-0.5 caption font-bold text-white"
            style={{ backgroundColor: 'var(--hb-primary, var(--toss-blue))' }}
          >
            베타
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <HeaderAuthSlot />
        </div>
      </div>
    </header>
  );
}

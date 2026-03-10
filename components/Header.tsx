'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import HeaderAuthSlot from '@/components/layout/HeaderAuthSlot';

export default function Header() {
  const pathname = usePathname();
  const isLegacy = pathname === '/login';

  if (isLegacy) {
    return (
      <header
        className="z-50"
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
          <div className="flex items-center gap-2">
            <HeaderAuthSlot />
          </div>
        </div>
      </header>
    );
  }

  /* 비레거시(기존 토스형) 헤더 - 다른 페이지용 */
  return (
    <header
      className="border-b border-black/5 z-50 bg-[var(--toss-card)]"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 64 }}
    >
      <div className="flex items-center justify-between h-full px-4 max-w-[1320px] mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <span className="h3 font-black tracking-tight text-[var(--toss-text)]">HANBANG</span>
          <span className="rounded-full px-2 py-0.5 caption font-bold text-white bg-[var(--toss-blue)]">베타</span>
        </Link>
        <div className="flex items-center gap-2">
          <HeaderAuthSlot />
        </div>
      </div>
    </header>
  );
}

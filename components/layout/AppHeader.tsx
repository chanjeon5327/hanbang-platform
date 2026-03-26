'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import HeaderAuthSlot from '@/components/layout/HeaderAuthSlot';

const NAV_LINKS = [
  { href: '/', label: '홈' },
  { href: '/market', label: '마켓' },
  { href: '/goods', label: '굿즈' },
  { href: '/content', label: '콘텐츠' },
  { href: '/support/chat', label: '챗' },
  { href: '/mypage', label: '마이페이지' },
];

export default function AppHeader() {
  const pathname = usePathname();
  const isLogin = pathname === '/login';
  const isHome = pathname === '/';

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
        <div className="mx-auto flex h-full max-w-[1320px] items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="text-xl font-black tracking-tight" style={{ color: 'var(--legacy-text)' }}>
              HANBANG
            </span>
            <span
              className="rounded-full px-2.5 py-1 text-xs font-bold"
              style={{ backgroundColor: 'var(--legacy-pill-bg)', color: 'var(--legacy-pill-text)' }}
            >
              베타
            </span>
          </Link>
          <HeaderAuthSlot variant="light" />
        </div>
      </header>
    );
  }

  if (isHome) {
    return (
      <header className="fixed left-0 top-0 z-50 w-full border-0 bg-transparent">
        <div className="mx-auto flex w-full max-w-[1320px] items-center justify-between px-6 py-4">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element -- 로컬 BI SVG */}
            <img src="/logo-h-white.svg" alt="" className="h-7 w-7" width={28} height={28} />
            <span className="font-semibold tracking-wide text-white">HANBANG</span>
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold text-white">베타</span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-white/80 md:flex" aria-label="주 메뉴">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive =
                href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/');
              return (
                <Link
                  key={href}
                  href={href}
                  className={`transition hover:text-white ${isActive ? 'font-semibold text-white' : ''}`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <HeaderAuthSlot variant="dark" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header
      className="z-[200] border-b"
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
      <div className="mx-auto flex h-full max-w-[1320px] items-center justify-between px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="h3 font-black tracking-tight" style={{ color: 'var(--hb-text, var(--toss-text))' }}>
            HANBANG
          </span>
          <span
            className="caption rounded-full bg-white px-2 py-0.5 font-bold text-white"
            style={{ backgroundColor: 'var(--hb-primary, var(--toss-blue))' }}
          >
            베타
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="주 메뉴">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive =
              href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className="rounded-lg px-3 py-1.5 text-[14px] font-medium transition-colors"
                style={{
                  color: isActive
                    ? 'var(--hb-primary, var(--toss-blue))'
                    : 'var(--hb-text, var(--toss-text))',
                  backgroundColor: isActive ? 'var(--hb-primary-muted, rgba(0,90,255,0.06))' : 'transparent',
                }}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <HeaderAuthSlot variant="light" />
        </div>
      </div>
    </header>
  );
}

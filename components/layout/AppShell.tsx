'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import AppHeader from '@/components/layout/AppHeader';
import AppFooter from '@/components/layout/AppFooter';
import BottomNav from '@/components/layout/BottomNav';
import AppContainer from '@/components/layout/AppContainer';
import DemoRouteBar from '@/components/DemoRouteBar';

const HIDE_LAYOUT_PATHS = ['/login'];
const SHOW_DEMO_BAR = process.env.NEXT_PUBLIC_DEMO_BAR === 'true';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideLayout = HIDE_LAYOUT_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
  const isHome = pathname === '/';

  useEffect(() => {
    if (pathname === '/login' && process.env.NODE_ENV === 'development') {
      console.info('[login-guard-check] AppShell pathname=/login no redirect');
    }
  }, [pathname]);

  if (hideLayout) {
    return (
      <>
        <AppHeader />
        <main
          className="main-with-bottom-nav flex-1 overflow-y-auto"
          style={{ paddingTop: isHome ? 0 : 64 }}
        >
          {SHOW_DEMO_BAR && <DemoRouteBar />}
          {children}
        </main>
        <BottomNav />
      </>
    );
  }

  // 홈 전용 레이아웃: 히어로 100svh 가 viewport 전체를 차지하도록
  // nested-scroll(main flex-1 overflow-y-auto) 대신 document scroll 사용.
  if (isHome) {
    return (
      <div style={{ backgroundColor: 'var(--hb-bg, var(--bg))' }}>
        <AppHeader />
        <main className="main-with-bottom-nav" style={{ paddingTop: 0 }}>
          {SHOW_DEMO_BAR && <DemoRouteBar />}
          <AppContainer>{children}</AppContainer>
        </main>
        <AppFooter />
        <BottomNav />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col pb-20 md:pb-8"
      style={{ backgroundColor: 'var(--hb-bg, var(--bg))' }}
    >
      <AppHeader />
      <main
        className="main-with-bottom-nav flex-1 overflow-y-auto"
        style={{
          paddingTop: isHome ? 0 : 64,
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {SHOW_DEMO_BAR && <DemoRouteBar />}
        <AppContainer>{children}</AppContainer>
      </main>
      <AppFooter />
      <BottomNav />
    </div>
  );
}

'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { StatusGuard } from '@/components/auth/StatusGuard';

/** /login, /signup 에서는 StatusGuard(리다이렉트) 완전 bypass */
const SKIP_PATHS = ['/login', '/signup'];
function shouldSkipRedirect(pathname: string): boolean {
  return SKIP_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

/**
 * /login, /signup 에서는 리다이렉트 로직 완전 skip
 * - 온보딩/홈 이동 등 자동 redirect 금지
 */
export function OnboardingRedirectGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (shouldSkipRedirect(pathname)) {
    if (process.env.NODE_ENV === 'development') {
      console.info('[login-guard-check] OnboardingRedirectGuard skipped redirect pathname=', pathname);
    }
    return <>{children}</>;
  }

  return <StatusGuard>{children}</StatusGuard>;
}

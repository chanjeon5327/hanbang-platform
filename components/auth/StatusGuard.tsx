'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { getRedirectPath } from '@/lib/auth/userStatus';

/** /login, /signup 등에서 전역 리다이렉트 절대 금지 */
const NO_REDIRECT_PATHS = ['/login', '/signup'];
function isNoRedirectPath(pathname: string): boolean {
  return NO_REDIRECT_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

/** ACTIVE가 아닐 때 KYC/온보딩으로 리다이렉트 (읽기 허용 경로 제외) */
const READ_ONLY_PATHS = [
  '/',
  '/login',
  '/signup',
  '/auth',
  '/kyc',
  '/onboarding',
  '/projects',
  '/market',
  '/active-invest',
  '/notice',
  '/demo',
  '/mypage',
  '/settings',
  '/profile',
  '/forgot-password',
  '/reset-password',
];

function isReadOnlyPath(pathname: string): boolean {
  return READ_ONLY_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

/** 투자/주문/지갑 핵심 액션 경로 - ACTIVE 필수 */
const ACTION_PATHS = ['/invest', '/order', '/wallet/deposit', '/wallet/withdraw', '/wallet/swap'];

function isActionPath(pathname: string): boolean {
  return ACTION_PATHS.some((p) => pathname.startsWith(p));
}

export function StatusGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading || !user) return;
    if (isNoRedirectPath(pathname)) {
      if (process.env.NODE_ENV === 'development') {
        console.info('[login-guard-check] StatusGuard skipped redirect pathname=', pathname);
      }
      return;
    }

    const check = async () => {
      const res = await fetch('/api/user/status', { cache: 'no-store' });
      const json = await res.json().catch(() => ({}));
      const status = json.status ?? 'NEW';

      if (status === 'SUSPENDED') return; // AuthProvider/session에서 로그아웃 처리

      const redirect = getRedirectPath(status);
      if (!redirect) return; // ACTIVE

      // 이미 해당 플로우 페이지에 있으면 리다이렉트 안 함
      if (pathname.startsWith('/kyc') && (status === 'NEW' || status === 'KYC_REQUIRED' || status === 'KYC_SUBMITTED')) return;
      if (pathname.startsWith('/onboarding') && (status === 'KYC_APPROVED' || status === 'ONBOARDING_REQUIRED')) return;

      // 핵심 액션 경로에서 ACTIVE 아님 → 리다이렉트
      if (isActionPath(pathname)) {
        if (process.env.NODE_ENV === 'development') {
          console.info('[LOGIN-REDIRECT-SOURCE] StatusGuard', { pathname, user: !!user, session: !!user, isAuthed: !!user });
        }
        router.replace(redirect);
        return;
      }

      // 그 외: 메인/마이페이지 등은 허용 (읽기)
    };

    check();
  }, [user, loading, pathname, router]);

  return <>{children}</>;
}

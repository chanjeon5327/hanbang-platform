'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { useUnifiedAuthState } from './useUnifiedAuthState';

/**
 * 인증 가드 훅
 * - 비로그인 시 /login?redirect=현재경로로 이동
 * - 로그인 + 온보딩 미완료 시 /onboarding?redirect=원래경로로 이동
 * - KYC 필요 시 /kyc로 이동 (선택적)
 */
export function useAuthGate(options?: {
  requireKyc?: boolean;
  redirectPath?: string;
}) {
  const router = useRouter();
  const pathname = usePathname() ?? '/';
  const { loading, isAuthenticated } = useUnifiedAuthState();

  const requireLogin = useCallback(() => {
    if (loading) return false;
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return false;
    }
    return true;
  }, [loading, isAuthenticated, router, pathname]);

  return {
    loading,
    isAuthenticated,
    requireLogin,
  };
}

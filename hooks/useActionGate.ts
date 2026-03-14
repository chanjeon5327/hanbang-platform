'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getBrowserSupabase } from '@/utils/supabase/client';

export type ActionGateState = {
  loading: boolean;
  needsLogin: boolean;
  loginHref: string;
  kycHref: string;
  walletHref: string;
};

/**
 * 버튼/CTA 분기용: 로그인 필요 여부 및 이동 경로
 * - 비로그인 → /login?redirect=현재경로
 * - KYC 필요 → /kyc
 * - 지갑 필요 → /wallet
 */
export function useActionGate(): ActionGateState {
  const pathname = usePathname() ?? '/';
  const [loading, setLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let alive = true;
    getBrowserSupabase()
      .auth.getSession()
      .then((res: { data: { session?: { user?: unknown } } }) => {
        if (alive) setHasSession(!!res.data.session?.user);
      })
      .catch(() => {
        if (alive) setHasSession(false);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const redirect = encodeURIComponent(pathname);
  return {
    loading,
    needsLogin: !hasSession,
    loginHref: `/login?redirect=${redirect}`,
    kycHref: '/kyc',
    walletHref: '/wallet',
  };
}

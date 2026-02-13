'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';

/**
 * /wallet 클라이언트 사이드 인증 가드
 * - 로그인 안 된 상태에서 접근 시 /login으로 리다이렉트
 * - 서버 가드와 이중 방어
 */
export function WalletGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--toss-bg)]">
        <span className="text-[var(--toss-text-secondary)] animate-pulse">확인 중…</span>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}

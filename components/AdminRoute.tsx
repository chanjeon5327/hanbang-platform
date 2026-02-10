'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  /**
   * ✅ 인증 없이 허용되는 관리자 페이지
   * - 로그인
   * - 주문 상세 (PG/정산 증빙)
   * - 정산 상세 (PG/정산 증빙)
   */
  if (
    pathname === '/admin/login' ||
    pathname.startsWith('/admin/orders/') ||
    pathname.startsWith('/admin/settlement/')
  ) {
    return <>{children}</>;
  }

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Loader2
          className="h-10 w-10 animate-spin"
          style={{ color: 'var(--accent-color)', marginBottom: '20px' }}
        />
        <p style={{ color: 'var(--text-secondary)' }}>
          인증 확인 중…
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

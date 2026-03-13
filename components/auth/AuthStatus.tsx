'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';

export function AuthStatus() {
  const router = useRouter();
  const pathname = usePathname() ?? '/';
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        padding: '6px 12px',
        fontSize: '12px',
        color: '#666',
        whiteSpace: 'nowrap'
      }}>
        확인 중...
      </div>
    );
  }

  if (user) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 12px',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderRadius: '16px',
        border: '1px solid rgba(34, 197, 94, 0.2)',
        whiteSpace: 'nowrap'
      }}>
        <span style={{ fontSize: '12px', color: '#22c55e', fontWeight: '600' }}>
          로그인됨: {user.email || user.id.slice(0, 8)}
        </span>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '6px 12px',
      backgroundColor: 'rgba(156, 163, 175, 0.1)',
      borderRadius: '16px',
      border: '1px solid rgba(156, 163, 175, 0.2)',
      whiteSpace: 'nowrap'
    }}>
      <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '600' }}>
        로그아웃 상태
      </span>
      <button
        onClick={() => router.push(`/login?redirect=${encodeURIComponent(pathname)}`)}
        style={{
          padding: '4px 8px',
          fontSize: '11px',
          backgroundColor: 'transparent',
          border: '1px solid rgba(156, 163, 175, 0.3)',
          borderRadius: '8px',
          color: '#9ca3af',
          cursor: 'pointer',
          fontWeight: '600',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(156, 163, 175, 0.2)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
      >
        로그인 페이지로
      </button>
    </div>
  );
}

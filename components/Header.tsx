'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUserAuth } from '@/context/UserAuthContext';
import { logout } from '@/lib/auth/logout';

export default function Header() {
  const { user, loading } = useUserAuth();
  const router = useRouter();

  if (loading) return null;

  const handleLogin = () => {
    console.log('[HB][HEADER] 로그인 진입 → /login');
    router.push('/login');
  };

  const handleLogout = async () => {
    console.log('[HB][HEADER] 로그아웃 (Supabase 기준)');
    await logout();
  };

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b">
      <Link href="/">HANBANG</Link>

      <nav className="flex gap-4 items-center">
        {user ? (
          <>
            <span className="text-sm text-gray-600">
              {user.email}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm text-red-600"
            >
              로그아웃
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={handleLogin}
            className="text-sm text-blue-600"
          >
            로그인
          </button>
        )}
      </nav>
    </header>
  );
}

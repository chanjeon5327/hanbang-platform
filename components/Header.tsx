'use client';

import Link from 'next/link';
import { useUserAuth } from '@/context/UserAuthContext';

export default function Header() {
  const { user, loading, signOut } = useUserAuth();

  if (loading) return null;

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
              onClick={signOut}
              className="text-sm text-red-600"
            >
              로그아웃
            </button>
          </>
        ) : (
          <Link href="/login">로그인</Link>
        )}
      </nav>
    </header>
  );
}

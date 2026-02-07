'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { useEffect, useState } from 'react';

export default function Header() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
    router.refresh();
  };

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b">
      <Link href="/" className="font-bold text-lg">
        HANBANG
      </Link>

      <nav className="flex gap-4 items-center">
        {isLoggedIn ? (
          <>
            <Link href="/wallet">지갑</Link>
            <button
              onClick={handleLogout}
              className="text-red-600 font-semibold"
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

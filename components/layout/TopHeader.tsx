// components/layout/TopHeader.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function TopHeader() {
  const supabase = createClient();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsLoggedIn(!!session);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('hb_user'); // 보조 캐시 제거
    router.push('/login');
  };

  return (
    <header className="flex items-center justify-between border-b px-4 py-3">
      <div
        className="cursor-pointer font-bold"
        onClick={() => router.push('/')}
      >
        HANBANG
      </div>

      <div className="flex items-center gap-3">
        {isLoggedIn ? (
          <>
            <button
              onClick={() => router.push('/wallet')}
              className="text-sm"
            >
              지갑
            </button>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600"
            >
              로그아웃
            </button>
          </>
        ) : (
          <button
            onClick={() => router.push('/login')}
            className="text-sm"
          >
            로그인
          </button>
        )}
      </div>
    </header>
  );
}

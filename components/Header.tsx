'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import LoginModal from '@/components/auth/LoginModal';
import { createBrowserClient } from '@supabase/ssr';
import type { Session } from '@supabase/supabase-js';

export default function Header() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [session, setSession] = useState<Session | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);

  // ✅ 최초 로드 + 인증 상태 변경 감지
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  return (
    <>
      <header className="w-full border-b px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg">
          HHANBANG
        </Link>

        {session ? (
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-600">
              {session.user.email}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-1.5 border rounded-md"
            >
              로그아웃
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setLoginOpen(true)}
            className="px-4 py-1.5 border rounded-md text-sm"
          >
            로그인 / 회원가입
          </button>
        )}
      </header>

      <LoginModal
        open={loginOpen}
        onOpenChange={setLoginOpen}
      />
    </>
  );
}

'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClientCompat } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const finalizeSession = async () => {
      const supabase = createBrowserClientCompat();

      const code = searchParams.get('code');
      if (!code) {
        router.replace('/login');
        return;
      }

      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('OAuth 세션 교환 실패:', error);
        router.replace('/login');
        return;
      }

      // ✅ 세션 정상 확정
      router.replace('/');
    };

    finalizeSession();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500 text-sm">로그인 처리 중입니다…</p>
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getBrowserSupabase } from '@/utils/supabase/client';

export default function AuthCallback() {
  const router = useRouter();
  const supabase = getBrowserSupabase();

  useEffect(() => {
    async function handle() {
      await supabase.auth.exchangeCodeForSession(window.location.href);
      router.replace('/reset-password');
    }
    handle();
  }, []);

  return <div>처리 중...</div>;
}

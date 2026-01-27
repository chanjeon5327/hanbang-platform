'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export function useAuthGuard() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        alert('로그인이 필요합니다.');
        router.replace('/login');
        return;
      }

      setChecking(false);
    };

    checkAuth();
  }, [router]);

  return { checking };
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export function useAuthGuard() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        alert('濡쒓렇?몄씠 ?꾩슂?⑸땲??');
        router.replace('/login');
        return;
      }

      setChecking(false);
    };

    checkAuth();
  }, [router]);

  return { checking };
}


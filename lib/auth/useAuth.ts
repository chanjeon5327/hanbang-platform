'use client';

import { useState, useEffect, useCallback } from 'react';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { getBrowserSupabase } from '@/utils/supabase/client';
import { signOutAndCleanup } from './signOut';

export type UseAuthReturn = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthed: boolean;
  signOut: (redirectTo?: string) => Promise<void>;
};

/**
 * Supabase session 기준 단일 인증 훅 (핵심 로직)
 * - onAuthStateChange 반영
 * - signOut: supabase.auth.signOut() + localStorage 정리 + 리다이렉트
 * - AuthProvider가 이 훅을 사용하며, 컴포넌트는 AuthProvider의 useAuth 사용
 */
export function useSupabaseAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = getBrowserSupabase();

  const signOut = useCallback(async (redirectTo = '/') => {
    await signOutAndCleanup(redirectTo);
  }, []);

  useEffect(() => {
    if (!supabase?.auth) {
      setUser(null);
      setSession(null);
      setIsLoading(false);
      return;
    }

    const init = async () => {
      const { data: { session: s } } = await supabase.auth.getSession();
      setSession(s);
      setUser(s?.user ?? null);
      setIsLoading(false);
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, s: Session | null) => {
        setSession(s);
        setUser(s?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  return {
    user,
    session,
    isLoading,
    isAuthed: !!user,
    signOut,
  };
}

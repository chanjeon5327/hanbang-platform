'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import LoginModal from './LoginModal';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  openLoginModal: () => void;
  closeLoginModal: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const applySession = useCallback((s: Session | null, u: User | null) => {
    setSession(s);
    setUser(u);
    setLoading(false);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    const init = async () => {
      try {
        // 1) 저장된 세션 먼저 읽기 (localStorage/cookie)
        const { data: sessionData } = await supabase.auth.getSession();
        let s = sessionData.session ?? null;
        let u = s?.user ?? null;

        if (!mounted) return;

        // 2) 세션이 있으면 서버에 재검증 (만료 토큰 갱신)
        if (s) {
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          if (!mounted) return;
          if (!refreshError && refreshData.session) {
            s = refreshData.session;
            u = refreshData.session.user;
          }
        }

        // 3) 유저 정지(SUSPENDED) 시 로그아웃
        if (u) {
          const { data: profile } = await supabase.from('profiles').select('status').eq('id', u.id).single();
          if (profile?.status === 'SUSPENDED') {
            await supabase.auth.signOut();
            s = null;
            u = null;
          }
        }

        applySession(s, u);
      } catch {
        if (!mounted) return;
        applySession(null, null);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!mounted) return;
      let s = newSession ?? null;
      let u = s?.user ?? null;

      if (u) {
        const { data: profile } = await supabase.from('profiles').select('status').eq('id', u.id).single();
        if (profile?.status === 'SUSPENDED') {
          await supabase.auth.signOut();
          s = null;
          u = null;
        }
      }

      applySession(s, u);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [applySession]);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setLoginModalOpen(false);
    router.push('/');
  }, [router]);

  const openLoginModal = useCallback(() => setLoginModalOpen(true), []);
  const closeLoginModal = useCallback(() => setLoginModalOpen(false), []);

  const value: AuthContextType = {
    user,
    session,
    loading,
    signOut,
    openLoginModal,
    closeLoginModal,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

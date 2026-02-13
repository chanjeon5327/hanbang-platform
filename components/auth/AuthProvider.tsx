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

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        let session = data.session ?? null;
        let userData = session?.user ?? null;

        // 유저 정지(SUSPENDED) 시 로그인 차단: 즉시 로그아웃
        if (userData) {
          const { data: profile } = await supabase.from('profiles').select('status').eq('id', userData.id).single();
          if (profile?.status === 'SUSPENDED') {
            await supabase.auth.signOut();
            session = null;
            userData = null;
          }
        }

        setSession(session);
        setUser(userData);
      } catch {
        if (!mounted) return;
        setSession(null);
        setUser(null);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!mounted) return;
      let session = newSession ?? null;
      let userData = session?.user ?? null;

      // 유저 정지 시 로그아웃
      if (userData) {
        const { data: profile } = await supabase.from('profiles').select('status').eq('id', userData.id).single();
        if (profile?.status === 'SUSPENDED') {
          await supabase.auth.signOut();
          session = null;
          userData = null;
        }
      }

      setSession(session);
      setUser(userData);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

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

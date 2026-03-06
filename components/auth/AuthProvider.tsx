'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import LoginModal from './LoginModal';
import { clearAuthStorage } from '@/lib/auth/clearStorage';
import { signOutAndCleanup } from '@/lib/auth/signOut';
import { getBrowserSupabase } from '@/utils/supabase/client';

type Profile = { display_name?: string | null; status?: string; role?: string } | null;

type AuthContextType = {
  user: User | null;
  profile: Profile;
  loading: boolean;
  isAuthed: boolean;
  signOut: (redirectTo?: string) => Promise<void>;
  refreshSession: () => Promise<void>;
  openLoginModal: () => void;
  closeLoginModal: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile>(null);
  const [loading, setLoading] = useState(true);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    if (pathname === '/login' && process.env.NODE_ENV === 'development') {
      console.info('[LOGIN-REDIRECT-SOURCE] AuthProvider', { pathname: '/login', user: !!user, session: !!user, isAuthed: !!user });
    }
  }, [pathname, user]);

  const initSession = useCallback(async () => {
    try {
      const supabase = getBrowserSupabase();
      if (!supabase?.auth) {
        if (mountedRef.current) {
          setUser(null);
          setProfile(null);
        }
        return;
      }
      const { data: { session }, error } = await supabase.auth.getSession();
      if (!mountedRef.current) return;
      if (error) {
        setUser(null);
        setProfile(null);
        clearAuthStorage();
        return;
      }
      const u = session?.user ?? null;
      setUser(u);
      if (!u) {
        setProfile(null);
        clearAuthStorage();
        return;
      }
      const res = await fetch('/api/auth/session', { cache: 'no-store' });
      const json = await res.json();
      if (!mountedRef.current) return;
      if (json.profile?.status === 'SUSPENDED' || !json.user) {
        setUser(null);
        setProfile(null);
        clearAuthStorage();
      } else {
        setUser(json.user);
        setProfile(json.profile ?? null);
      }
    } catch {
      if (mountedRef.current) {
        setUser(null);
        setProfile(null);
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  const refreshSession = useCallback(async () => {
    setLoading(true);
    await initSession();
  }, [initSession]);

  useEffect(() => {
    mountedRef.current = true;
    initSession();
    return () => {
      mountedRef.current = false;
    };
  }, [initSession]);

  useEffect(() => {
    const supabase = getBrowserSupabase();
    if (!supabase?.auth) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      initSession();
    });
    return () => subscription.unsubscribe();
  }, [initSession]);

  const signOut = useCallback(async (redirectTo = '/') => {
    await signOutAndCleanup(redirectTo);
  }, []);

  const openLoginModal = useCallback(() => setLoginModalOpen(true), []);
  const closeLoginModal = useCallback(() => setLoginModalOpen(false), []);

  const value: AuthContextType = {
    user,
    profile,
    loading,
    isAuthed: !!user,
    signOut,
    refreshSession,
    openLoginModal,
    closeLoginModal,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} onSuccess={refreshSession} />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

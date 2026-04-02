'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import LoginModal from './LoginModal';
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
      console.info('[LOGIN-REDIRECT-SOURCE] AuthProvider', { pathname: '/login', user: !!user, isAuthed: !!user });
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

      // getSession() ?쇰줈 濡쒖뺄 ?좏겙 ?뺤씤 (?ㅽ듃?뚰겕 遺덊븘?? AuthSessionMissingError ?놁쓬)
      const { data: { session }, error } = await supabase.auth.getSession();
      if (!mountedRef.current) return;

      if (error) {
        // ?좏겙 ?ㅻ쪟(refresh_token_not_found ?? ???곹깭 珥덇린??        setUser(null);
        setProfile(null);
        return;
      }

      const u = session?.user ?? null;
      setUser(u);

      if (!u) {
        setProfile(null);
        return;
      }

      // ?쒕쾭?먯꽌 ?꾨줈??+ ?뺤? ?щ? ?뺤씤
      try {
        const res = await fetch('/api/auth/session', { cache: 'no-store' });
        if (!res.ok) throw new Error(`session API ${res.status}`);
        const json = await res.json();
        if (!mountedRef.current) return;

        if (json.profile?.status === 'SUSPENDED' || !json.user) {
          // ?뺤? 怨꾩젙 ???꾩쟾 濡쒓렇?꾩썐
          await signOutAndCleanup('/login?reason=suspended');
          return;
        }
        setUser(json.user);
        setProfile(json.profile ?? null);
      } catch {
        // API ?ㅻ쪟 ??getSession 湲곕컲 user???좎? (?좏겙? 嫄대뱶由ъ? ?딆쓬)
        if (mountedRef.current) setProfile(null);
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

  // onAuthStateChange: 濡쒓렇??濡쒓렇?꾩썐 ?대깽?몃? 利됱떆 UI??諛섏쁺
  useEffect(() => {
    const supabase = getBrowserSupabase();
    if (!supabase?.auth) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      if (!mountedRef.current) return;

      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // ?곹깭媛 諛붾뚯뿀?쇰?濡??쒕쾭 ?몄뀡 ?ы솗??        initSession();
      }
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

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import LoginModal from './LoginModal';
import { clearAuthStorage } from '@/lib/auth/clearStorage';
import { createClient } from '@/utils/supabase/client';

type Profile = { display_name?: string | null; status?: string; role?: string } | null;

type AuthContextType = {
  user: User | null;
  profile: Profile;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  openLoginModal: () => void;
  closeLoginModal: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile>(null);
  const [loading, setLoading] = useState(true);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const mountedRef = useRef(true);

  const initSession = useCallback(async () => {
    try {
      const supabase = createClient();
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

  const signOut = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    clearAuthStorage();
    setUser(null);
    setProfile(null);
    setLoginModalOpen(false);
    router.push('/');
  }, [router]);

  const openLoginModal = useCallback(() => setLoginModalOpen(true), []);
  const closeLoginModal = useCallback(() => setLoginModalOpen(false), []);

  const value: AuthContextType = {
    user,
    profile,
    loading,
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

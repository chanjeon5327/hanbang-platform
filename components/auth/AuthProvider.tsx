'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import LoginModal from './LoginModal';
import { clearAuthStorage } from '@/lib/auth/clearStorage';

type AuthContextType = {
  user: User | null;
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
  const [loading, setLoading] = useState(true);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const mountedRef = useRef(true);

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session', { cache: 'no-store' });
      const json = await res.json();
      const u = json.user ?? null;

      if (!mountedRef.current) return;
      setUser(u);
      // 세션 없을 때 localStorage 잔재 제거 (쿠키만 신뢰)
      if (!u) clearAuthStorage();
    } catch {
      if (mountedRef.current) setUser(null);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  const refreshSession = useCallback(async () => {
    setLoading(true);
    await fetchSession();
  }, [fetchSession]);

  useEffect(() => {
    mountedRef.current = true;
    fetchSession();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchSession]);

  const signOut = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    clearAuthStorage();
    setUser(null);
    setLoginModalOpen(false);
    router.push('/');
  }, [router]);

  const openLoginModal = useCallback(() => setLoginModalOpen(true), []);
  const closeLoginModal = useCallback(() => setLoginModalOpen(false), []);

  const value: AuthContextType = {
    user,
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

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabaseClient } from "@/lib/supabase/client";

type UserAuthContextType = {
  user: any;
  loading: boolean;
  signOut: () => Promise<void>;
};

const UserAuthContext = createContext<UserAuthContextType | undefined>(
  undefined
);

export function UserAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // ✅ 1. App Router 안전장치: 로딩 즉시 해제
    setLoading(false);

    // ✅ 2. 실제 세션은 비동기로 갱신
    const initSession = async () => {
      const { data } = await supabaseClient.auth.getSession();
      if (!mounted) return;
      setUser(data.session?.user ?? null);
    };

    initSession();

    // ✅ 3. 이후 로그인/로그아웃 반영
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabaseClient.auth.signOut();
    setUser(null);
  };

  return (
    <UserAuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  const ctx = useContext(UserAuthContext);
  if (!ctx) {
    throw new Error("useUserAuth must be used within UserAuthProvider");
  }
  return ctx;
}

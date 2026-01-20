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

    // ✅ 초기 세션 확인 (권장)
    const initSession = async () => {
      const { data, error } = await supabaseClient.auth.getSession();

      if (!mounted) return;

      if (error) {
        console.error("getSession error", error);
        setUser(null);
      } else {
        setUser(data.session?.user ?? null);
      }

      setLoading(false);
    };

    initSession();

    // ✅ 이후 로그인/로그아웃 감지
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    setLoading(true);
    await supabaseClient.auth.signOut();
    setUser(null);
    setLoading(false);
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

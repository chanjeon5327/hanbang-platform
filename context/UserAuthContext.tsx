"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";



type UserAuthContextType = {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
};

const UserAuthContext = createContext<UserAuthContextType | undefined>(
  undefined
);

export function UserAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // 1️⃣ 초기 세션 확인
    const initSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error || !data.session) {
        // 세션 없음 = 정상 상태
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(data.session.user);
      setLoading(false);
    };

    initSession();

    // 2️⃣ 인증 상태 변경 구독
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      if (!session) {
        // 로그아웃 / 세션 만료
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(session.user);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // 3️⃣ 로그아웃 (단일 진실)
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null); // ⭐ 즉시 UI 반영
  };

  return (
    <UserAuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error("useUserAuth must be used within UserAuthProvider");
  }
  return context;
}

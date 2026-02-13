"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { isAdminEmail } from "@/lib/admin/env";

export type AdminRole = 1 | 2 | 3 | 4 | 5;

interface AdminUser {
  email: string;
  name: string;
  role: AdminRole;
  roleName: string;
}

interface AuthContextType {
  adminUser: AdminUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  logout: () => Promise<void>;
  hasPermission: (requiredRole: AdminRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_NAMES: Record<AdminRole, string> = {
  1: "인턴",
  2: "사원",
  3: "팀장",
  4: "이사",
  5: "마스터",
};

function profileRoleToAdminRole(role: string | null): AdminRole {
  if (role === "ADMIN") return 5;
  return 5;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadAdminFromSession = useCallback(async () => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.email) {
      setAdminUser(null);
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, role, status")
      .eq("id", session.user.id)
      .single();

    // 유저 정지 시 관리자 접근 차단
    if (profile?.status === "SUSPENDED") {
      await supabase.auth.signOut();
      setAdminUser(null);
      return;
    }

    const isAdmin = isAdminEmail(session.user.email) || profile?.role === "ADMIN";
    if (!isAdmin) {
      setAdminUser(null);
      return;
    }
    const role = profileRoleToAdminRole(profile?.role ?? null);
    setAdminUser({
      email: session.user.email,
      name: profile?.display_name ?? session.user.email?.split("@")[0] ?? "관리자",
      role,
      roleName: ROLE_NAMES[role],
    });
  }, []);

  useEffect(() => {
    loadAdminFromSession().finally(() => setLoading(false));

    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadAdminFromSession();
    });
    return () => subscription.unsubscribe();
  }, [loadAdminFromSession]);

  const logout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setAdminUser(null);
    router.push("/admin/login");
  }, [router]);

  const hasPermission = (requiredRole: AdminRole) => {
    return !!adminUser && adminUser.role >= requiredRole;
  };

  return (
    <AuthContext.Provider
      value={{
        adminUser,
        isAuthenticated: !!adminUser,
        loading,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

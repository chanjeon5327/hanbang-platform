"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";

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
    const res = await fetch("/api/auth/session?admin=1", { cache: "no-store" });
    const json = await res.json();
    const { user, isAdmin, profile } = json;

    if (!user?.email || !isAdmin) {
      setAdminUser(null);
      return;
    }

    const role = profileRoleToAdminRole(profile?.role ?? null);
    setAdminUser({
      email: user.email,
      name: profile?.display_name ?? user.email?.split("@")[0] ?? "관리자",
      role,
      roleName: ROLE_NAMES[role],
    });
  }, []);

  useEffect(() => {
    loadAdminFromSession().finally(() => setLoading(false));
  }, [loadAdminFromSession]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    const { clearAuthStorage } = await import("@/lib/auth/clearStorage");
    clearAuthStorage();
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

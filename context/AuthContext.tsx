"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
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
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (requiredRole: AdminRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MASTER_ACCOUNT = {
  email: "chanjeon5327@gmail.com",
  password: "love54175327!!",
  name: "마스터 관리자",
  role: 5 as AdminRole,
  roleName: "마스터",
};

const ROLE_NAMES: Record<AdminRole, string> = {
  1: "인턴",
  2: "사원",
  3: "팀장",
  4: "이사",
  5: "마스터",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("admin_auth");
    if (saved) {
      try {
        setAdminUser(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load admin auth:", e);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    if (email === MASTER_ACCOUNT.email && password === MASTER_ACCOUNT.password) {
      const user: AdminUser = {
        email: MASTER_ACCOUNT.email,
        name: MASTER_ACCOUNT.name,
        role: MASTER_ACCOUNT.role,
        roleName: ROLE_NAMES[MASTER_ACCOUNT.role],
      };
      setAdminUser(user);
      localStorage.setItem("admin_auth", JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setAdminUser(null);
    localStorage.removeItem("admin_auth");
    router.push("/");
  };

  const hasPermission = (requiredRole: AdminRole) => {
    return !!adminUser && adminUser.role >= requiredRole;
  };

  return (
    <AuthContext.Provider
      value={{
        adminUser,
        isAuthenticated: !!adminUser,
        loading,
        login,
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

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
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (requiredRole: AdminRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 마스터 계정 정보
const MASTER_ACCOUNT = {
  email: "chanjeon5327@gmail.com",
  password: "love54175327!!",
  name: "마스터 관리자",
  role: 5 as AdminRole,
  roleName: "마스터",
};

// 역할 이름 매핑
const ROLE_NAMES: Record<AdminRole, string> = {
  1: "인턴",
  2: "사원",
  3: "팀장",
  4: "이사",
  5: "마스터",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    // localStorage에서 로그인 상태 확인
    const saved = localStorage.getItem("admin_auth");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAdminUser(parsed);
      } catch (e) {
        console.error("Failed to load admin auth:", e);
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // 마스터 계정 확인
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

    // 다른 관리자 계정은 여기서 추가 가능
    // 예: localStorage에서 관리자 리스트를 불러와서 확인

    return false;
  };

  const logout = () => {
    setAdminUser(null);
    localStorage.removeItem("admin_auth");
    router.push("/");
  };

  const hasPermission = (requiredRole: AdminRole): boolean => {
    if (!adminUser) return false;
    return adminUser.role >= requiredRole;
  };

  return (
    <AuthContext.Provider value={{ adminUser, isAuthenticated: !!adminUser, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}


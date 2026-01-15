"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LoginModal } from "@/components/auth/LoginModal";
import { User, Sun, Moon } from "lucide-react";

export function Header() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // 다크모드 상태 확인
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);

    // 로그인 상태 확인
    const checkUser = () => {
      const userData = localStorage.getItem("hb_user");
      if (userData) {
        try {
          const parsed = JSON.parse(userData);
          setUser({ name: parsed.name, email: parsed.email });
        } catch {
          setUser({ name: userData });
        }
      } else {
        setUser(null);
      }
    };

    checkUser();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "hb_user") checkUser();
    };

    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(checkUser, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    root.classList.toggle("dark");
    const dark = root.classList.contains("dark");
    setIsDark(dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  };

  const handleLogout = () => {
    localStorage.removeItem("hb_user");
    setUser(null);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">
              H
            </div>
            <span className="text-xl font-bold">HANBANG</span>
          </Link>

          <div className="flex items-center gap-2">
          {user ? (
  <>
    <Link href="/wallet">
      <Button variant="ghost" size="sm">
        내 지갑
      </Button>
    </Link>

    <Button variant="outline" size="sm" onClick={handleLogout}>
      로그아웃
    </Button>
  </>
) : (
  <Button onClick={() => setIsLoginModalOpen(true)}>
    로그인 / 회원가입
  </Button>
)}
          </div>
        </div>
      </header>

      <LoginModal
        open={isLoginModalOpen}
        onOpenChange={setIsLoginModalOpen}
      />
    </>
  );
}

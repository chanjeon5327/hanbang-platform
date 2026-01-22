"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/UserAuthContext";
import { supabase } from "@/lib/supabase/client";

export default function TopHeader() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (loading) return null;

  return (
    <header className="w-full h-12 flex items-center justify-between px-4 border-b">
      <Link href="/">HANBANG</Link>

      <nav className="flex gap-4">
        {user ? (
          <>
            <Link href="/protected">내 페이지</Link>
            <button onClick={handleLogout}>로그아웃</button>
          </>
        ) : (
          <Link href="/login">로그인</Link>
        )}
      </nav>
    </header>
  );
}

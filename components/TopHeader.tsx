"use client";

import { useRouter, usePathname } from "next/navigation";
import { useUserAuth } from "@/context/UserAuthContext";

export default function TopHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, signOut } = useUserAuth();

  // ✅ 로그인 페이지에서는 헤더 숨김
  if (pathname === "/login") return null;
  if (loading) return null;

  return (
    <header className="flex items-center justify-between px-4 py-2 border-b">
      <div className="font-bold">HANBANG</div>

      {user && (
        <button
          onClick={async () => {
            await signOut();
            router.replace("/login");
          }}
        >
          로그아웃
        </button>
      )}
    </header>
  );
}

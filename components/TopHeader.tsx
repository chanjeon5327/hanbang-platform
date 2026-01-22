"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { isAuthenticated } from "@/lib/auth/session";
import { hardLogout } from "@/lib/auth/logout";

export default function TopHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [authed, setAuthed] = useState<boolean | null>(null);

  // 로그인 페이지에서는 헤더 숨김
  if (pathname === "/login") return null;

  useEffect(() => {
    isAuthenticated().then(setAuthed);
  }, []);

  if (authed === null) return null;

  return (
    <header className="flex items-center justify-between px-4 py-2 border-b">
      <div className="font-bold">HANBANG</div>

      {authed && (
        <button
          onClick={async () => {
            await hardLogout();
          }}
        >
          로그아웃
        </button>
      )}
    </header>
  );
}

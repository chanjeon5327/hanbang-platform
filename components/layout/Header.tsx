"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

type HBUser = { email?: string | null };

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  // ✅ 훅은 "무조건" 동일하게 호출되어야 함 (여기서 return 하면 안 됨)
  const [user, setUser] = useState<HBUser | null>(null);
  const [loading, setLoading] = useState(true);

  const nav = useMemo(
    () => [
      { href: "/", label: "홈" },
      { href: "/market", label: "마켓" },
      { href: "/wallet", label: "지갑" },
    ],
    []
  );

  useEffect(() => {
    let mounted = true;

    const sync = async () => {
      setLoading(true);
      const { data, error } = await supabase.auth.getUser();
      if (!mounted) return;

      if (error || !data.user) setUser(null);
      else setUser({ email: data.user.email });

      setLoading(false);
    };

    sync();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      sync();
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  const onLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}

    try {
      localStorage.removeItem("hb_user");
    } catch {}

    router.push("/login");
    router.refresh();
  };

  // ✅ 이제 훅 다 호출한 뒤에 "렌더링만" 막는다 (훅 규칙 위반 없음)
  const hideHeader = pathname === "/login";
  if (hideHeader) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-[56px] max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-semibold tracking-tight">
          HANBANG
        </Link>

        <nav className="flex items-center gap-2 text-sm">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "rounded-md px-3 py-2 transition",
                  active ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 text-sm">
          {loading ? (
            <span className="text-gray-500">…</span>
          ) : user?.email ? (
            <>
              <span className="hidden max-w-[220px] truncate text-gray-600 sm:inline">
                {user.email}
              </span>
              <button
                onClick={onLogout}
                className="rounded-md border border-gray-300 px-3 py-2 hover:bg-gray-50"
              >
                로그아웃
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-gray-900 px-3 py-2 text-white hover:opacity-90"
            >
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

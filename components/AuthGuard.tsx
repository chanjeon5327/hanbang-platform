"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserAuth } from "@/context/UserAuthContext";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUserAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        로그인 상태 확인 중...
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}

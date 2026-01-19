"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserAuth } from "@/context/UserAuthContext";
import WalletView from "@/components/wallet/WalletView";

export default function WalletPage() {
  const router = useRouter();
  const { user, loading } = useUserAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return <div style={{ padding: 40 }}>로딩중...</div>;
  }

  if (!user) {
    return <div style={{ padding: 40 }}>로그인이 필요합니다.</div>;
  }

  // ✅ 여기 중요
  return <WalletView />;
}

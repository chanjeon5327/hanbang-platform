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

  if (loading || !user) {
    return null;
  }

  return <WalletView />;
}

"use client";

import { ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { config } from "@/lib/wagmi";
import { StoreProvider } from "@/context/StoreContext";
import { UserAuthProvider } from "@/context/UserAuthContext";
import AuthGuard from "@/components/AuthGuard";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <UserAuthProvider>
        <AuthGuard>
          <StoreProvider>{children}</StoreProvider>
        </AuthGuard>
      </UserAuthProvider>
    </WagmiProvider>
  );
}

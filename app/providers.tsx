"use client";

import { ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { config } from "@/lib/wagmi";
import { StoreProvider } from "@/context/StoreContext";
import { UserAuthProvider } from "@/context/UserAuthContext";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <UserAuthProvider>
        <StoreProvider>
          {children}
        </StoreProvider>
      </UserAuthProvider>
    </WagmiProvider>
  );
}

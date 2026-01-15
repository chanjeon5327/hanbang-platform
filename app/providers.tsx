"use client";

import { WagmiProvider } from "wagmi";
import { config } from "@/lib/wagmi";
import { StoreProvider } from "@/context/StoreContext";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WagmiProvider config={config}>
      <StoreProvider>
        {children}
      </StoreProvider>
    </WagmiProvider>
  );
}

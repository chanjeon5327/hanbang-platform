'use client';

import { WagmiProvider } from 'wagmi';
import { wagmiConfig } from '@/lib/wagmi/config';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      {children}
    </WagmiProvider>
  );
}

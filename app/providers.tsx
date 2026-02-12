'use client';

import { ReactNode } from 'react';
import { StoreProvider } from '@/context/StoreContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { TokenProvider } from '@/context/TokenContext';
import { Providers as WagmiProviders } from '@/components/providers/WagmiProvider';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProviders>
      <ThemeProvider>
        <TokenProvider>
          <StoreProvider>
            {children}
          </StoreProvider>
        </TokenProvider>
      </ThemeProvider>
    </WagmiProviders>
  );
}

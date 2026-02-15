'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { StoreProvider } from '@/context/StoreContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { TokenProvider } from '@/context/TokenContext';
import { Providers as WagmiProviders } from '@/components/providers/WagmiProvider';
import { ToastProvider } from '@/context/ToastContext';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProviders>
      <ThemeProvider>
        <TokenProvider>
          <AuthProvider>
            <StoreProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </StoreProvider>
          </AuthProvider>
        </TokenProvider>
      </ThemeProvider>
    </WagmiProviders>
  );
}

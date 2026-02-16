'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { StatusGuard } from '@/components/auth/StatusGuard';
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
            <StatusGuard>
              <StoreProvider>
                <ToastProvider>
                  {children}
                </ToastProvider>
              </StoreProvider>
            </StatusGuard>
          </AuthProvider>
        </TokenProvider>
      </ThemeProvider>
    </WagmiProviders>
  );
}

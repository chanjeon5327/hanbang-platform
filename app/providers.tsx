'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { OnboardingRedirectGuard } from '@/components/onboarding/OnboardingRedirectGuard';
import { StoreProvider } from '@/context/StoreContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { DataThemeProvider } from '@/context/DataThemeContext';
import { TokenProvider } from '@/context/TokenContext';
import { Providers as WagmiProviders } from '@/components/providers/WagmiProvider';
import { ToastProvider } from '@/context/ToastContext';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProviders>
      <DataThemeProvider>
      <ThemeProvider>
        <TokenProvider>
          <AuthProvider>
            <OnboardingRedirectGuard>
              <StoreProvider>
                <ToastProvider>
                  {children}
                </ToastProvider>
              </StoreProvider>
            </OnboardingRedirectGuard>
          </AuthProvider>
        </TokenProvider>
      </ThemeProvider>
      </DataThemeProvider>
    </WagmiProviders>
  );
}

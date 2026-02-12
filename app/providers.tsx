'use client';

import { ReactNode } from 'react';
import { StoreProvider } from '@/context/StoreContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { TokenProvider } from '@/context/TokenContext';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <TokenProvider>
        <StoreProvider>
          {children}
        </StoreProvider>
      </TokenProvider>
    </ThemeProvider>
  );
}

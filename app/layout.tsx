import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/components/Header';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});
import BuildStamp from '@/components/dev/BuildStamp';
import AppContainer from '@/components/layout/AppContainer';
import LegacyWrapper from '@/components/layout/LegacyWrapper';

import Providers from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'HANBANG',
  description: 'HANBANG Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" data-theme="apple" suppressHydrationWarning>
      <body className={inter.variable}>
        <Providers>
          <LegacyWrapper>
            <div className="min-h-screen flex flex-col">
              <Header />
              <div className="flex-1 overflow-y-auto" style={{ paddingTop: 64 }}>
                <AppContainer>
                  {children}
                </AppContainer>
              </div>
            </div>
          </LegacyWrapper>
        </Providers>
        <BuildStamp />
      </body>
    </html>
  );
}

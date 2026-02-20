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
          <Header />
          <main>
            <AppContainer>
              {children}
            </AppContainer>
          </main>
        </Providers>
        <BuildStamp />
      </body>
    </html>
  );
}

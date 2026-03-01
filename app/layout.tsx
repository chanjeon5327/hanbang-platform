import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/components/Header';
import BottomNavigation from '@/components/home/BottomNavigation';
import DemoRouteBar from '@/components/DemoRouteBar';

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

const SHOW_DEMO_BAR = process.env.NEXT_PUBLIC_DEMO_BAR === 'true';

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
              <div className="flex-1 overflow-y-auto main-with-bottom-nav" style={{ paddingTop: 64 }}>
                {SHOW_DEMO_BAR && <DemoRouteBar />}
                <AppContainer>
                  {children}
                </AppContainer>
              </div>
              <BottomNavigation />
            </div>
          </LegacyWrapper>
        </Providers>
        <BuildStamp />
      </body>
    </html>
  );
}

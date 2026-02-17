import type { Metadata } from 'next';
import localFont from 'next/font/local';
import Header from '@/components/Header';

const pretendard = localFont({
  src: '../public/fonts/Pretendard-Regular.woff2',
  variable: '--font-pretendard',
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
    <html lang="ko">
      <body className={pretendard.variable}>
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

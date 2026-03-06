import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});
import BuildStamp from '@/components/dev/BuildStamp';
import FloatingSupportBubble from '@/components/common/FloatingSupportBubble';
import AppShell from '@/components/layout/AppShell';
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
              <AppShell>{children}</AppShell>
            </div>
          </LegacyWrapper>
        </Providers>
        <BuildStamp />
        <FloatingSupportBubble />
      </body>
    </html>
  );
}

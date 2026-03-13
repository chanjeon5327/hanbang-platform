import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});
import BuildStamp from '@/components/dev/BuildStamp';
import FloatingSupportDock from '@/components/common/FloatingSupportDock';
import AppShell from '@/components/layout/AppShell';
import LegacyWrapper from '@/components/layout/LegacyWrapper';

import Providers from './providers';
import './globals.css';

const METADATA_BASE = 'https://hanbang-platform.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(METADATA_BASE),
  title: 'HANBANG',
  description: '내가 좋아하는 크리에이터와 동업자가 되고, 매달 수익을 받습니다.',
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: 'HANBANG',
    title: 'HANBANG',
    description: '내가 좋아하는 크리에이터와 동업자가 되고, 매달 수익을 받습니다.',
    url: METADATA_BASE,
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'HANBANG - 크리에이터 IP 투자 플랫폼',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HANBANG',
    description: '내가 좋아하는 크리에이터와 동업자가 되고, 매달 수익을 받습니다.',
    images: [
      {
        url: '/twitter-image',
        width: 1200,
        height: 630,
        alt: 'HANBANG - 크리에이터 IP 투자 플랫폼',
      },
    ],
  },
  icons: {
    icon: '/icon',
  },
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
        <FloatingSupportDock />
      </body>
    </html>
  );
}

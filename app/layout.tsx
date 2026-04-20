import type { Metadata } from 'next';
import { Inter, Noto_Sans_KR } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700', '800', '900'],
  variable: '--font-noto-sans-kr',
  display: 'swap',
});
import BuildStamp from '@/components/dev/BuildStamp';
import FloatingSupportDock from '@/components/common/FloatingSupportDock';
import AppShell from '@/components/layout/AppShell';
import LegacyWrapper from '@/components/layout/LegacyWrapper';

import Providers from './providers';
import './globals.css';

// QA H2 대응: 운영 도메인 기준으로 metadataBase / OG / 트위터 절대 URL을 정렬한다.
// NEXT_PUBLIC_SITE_URL 가 설정돼 있으면 그것을 우선 사용 (스테이징/프리뷰 대응),
// 없으면 운영 기본값 https://hanbang.io 을 사용한다.
const METADATA_BASE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://hanbang.io').replace(/\/$/, '');

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
    url: '/',
    images: [
      {
        url: `${METADATA_BASE}/opengraph-image`,
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
        url: `${METADATA_BASE}/twitter-image`,
        width: 1200,
        height: 630,
        alt: 'HANBANG - 크리에이터 IP 투자 플랫폼',
      },
    ],
  },
  icons: {
    icon: `${METADATA_BASE}/icon`,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" data-theme="apple" suppressHydrationWarning>
      <body className={`${inter.variable} ${notoSansKR.variable}`}>
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

import type { Metadata } from 'next';
import Header from '@/components/Header';
import BuildStamp from '@/components/dev/BuildStamp';

if (typeof window === 'undefined') {
  console.log('SERVER RENDER START');
}
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
      <body>
        <Providers>
          <Header />
          <main>{children}</main>
        </Providers>
        <BuildStamp />
      </body>
    </html>
  );
}

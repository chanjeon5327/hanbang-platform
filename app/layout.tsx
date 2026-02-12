import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

import ClientLayout from './ClientLayout';

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
    <html lang="ko" suppressHydrationWarning>
      <body>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('hanbang_theme');document.documentElement.classList.toggle('dark',t==='dark');})();`,
          }}
        />
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}

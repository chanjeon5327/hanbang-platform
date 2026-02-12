'use client';

import Providers from './providers';
import Header from '@/components/Header';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <Header />
      <div>{children}</div>
    </Providers>
  );
}

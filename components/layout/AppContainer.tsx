'use client';

import { usePathname } from 'next/navigation';

export default function AppContainer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === '/login') {
    return <>{children}</>;
  }

  const isHome = pathname === '/';

  if (isHome) {
    return (
      <main style={{ background: '#FFFFFF', minHeight: '100%' }}>
        {children}
      </main>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-8 pb-16 min-h-screen">
      {children}
    </div>
  );
}

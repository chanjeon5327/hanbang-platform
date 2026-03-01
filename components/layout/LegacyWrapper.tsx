'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function LegacyWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLegacy = pathname === '/login';
  const isHome = pathname === '/';

  useEffect(() => {
    if (isHome) {
      document.body.classList.add('hb-home');
    } else {
      document.body.classList.remove('hb-home');
    }
    return () => document.body.classList.remove('hb-home');
  }, [isHome]);

  if (isLegacy) {
    return <div className="hb-legacy min-h-screen flex flex-col">{children}</div>;
  }

  return <>{children}</>;
}

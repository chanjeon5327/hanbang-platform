'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

type FloatingSupportDockProps = {
  className?: string;
  chatHref?: string;
  contactHref?: string;
};

export default function FloatingSupportDock({
  className,
  chatHref = '/chat',
  contactHref = '/support',
}: FloatingSupportDockProps) {
  const pathname = usePathname();

  const isMarketDetail = useMemo(() => {
    if (!pathname) return false;
    return /^\/market\/[^/]+/.test(pathname);
  }, [pathname]);

  const isLoginPage = pathname === '/login';

  if (isLoginPage) return null;

  const containerClass = isMarketDetail
    ? 'right-2 bottom-28 sm:right-5 sm:bottom-32'
    : 'right-2 bottom-20 sm:right-5 sm:bottom-20';

  return (
    <div
      className={clsx(
        'fixed z-30 flex flex-col gap-2',
        containerClass,
        className,
      )}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <Link
        href={chatHref}
        aria-label="채팅"
        className="flex h-9 min-w-[44px] items-center justify-center rounded-full border border-white/10 bg-slate-950/86 px-2.5 text-[11px] font-semibold text-white shadow-[0_10px_24px_rgba(0,0,0,0.22)] backdrop-blur"
      >
        chat
      </Link>

      <Link
        href={contactHref}
        aria-label="1:1 문의"
        className="flex h-9 min-w-[44px] items-center justify-center rounded-full border border-white/10 bg-indigo-600/90 px-2.5 text-[11px] font-semibold text-white shadow-[0_10px_24px_rgba(0,0,0,0.22)] backdrop-blur"
      >
        1:1
      </Link>
    </div>
  );
}

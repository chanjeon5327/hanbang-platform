'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useUnifiedAuthState } from '@/hooks/useUnifiedAuthState';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';

type HeaderAuthSlotProps = {
  /** light: 밝은 배경(어두운 텍스트), dark: 어두운 배경(밝은 텍스트, 기본값) */
  variant?: 'light' | 'dark';
};

export default function HeaderAuthSlot({ variant = 'dark' }: HeaderAuthSlotProps) {
  const router = useRouter();
  const pathname = usePathname() ?? '/';
  const { loading, isAuthenticated, displayName } = useUnifiedAuthState();
  const redirect = encodeURIComponent(pathname);

  async function handleLogout() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.refresh();
  }

  const isLight = variant === 'light';
  const linkBase = isLight
    ? 'rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-black/80'
    : 'rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white/90';
  const displayText = isLight ? 'text-black/85' : 'text-white/85';
  const pulseBg = isLight ? 'bg-black/10' : 'bg-white/10';

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className={`h-9 w-20 animate-pulse rounded-full ${pulseBg}`} />
        <div className={`h-9 w-20 animate-pulse rounded-full ${pulseBg}`} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Link href={`/login?redirect=${redirect}`} className={linkBase}>
          로그인
        </Link>
        <Link
          href={`/login?mode=signup&redirect=${redirect}`}
          className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
        >
          회원가입
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className={`max-w-[120px] truncate text-sm ${displayText}`}>
        {displayName ?? '회원'}
      </span>
      <button type="button" onClick={handleLogout} className={linkBase}>
        로그아웃
      </button>
    </div>
  );
}


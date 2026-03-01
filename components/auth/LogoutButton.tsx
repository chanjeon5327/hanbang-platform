'use client';

import React from 'react';
import { signOutAndCleanup } from '@/lib/auth/signOut';

export default function LogoutButton({
  className,
  style,
  children,
  redirectTo = '/',
}: {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  redirectTo?: string;
}) {
  return (
    <button
      type="button"
      className={className}
      style={style}
      onClick={() => signOutAndCleanup(redirectTo)}
    >
      {children ?? '로그아웃'}
    </button>
  );
}

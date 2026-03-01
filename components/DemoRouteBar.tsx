'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

function isAdmin(profile: { role?: string } | null, email?: string | null): boolean {
  if (profile?.role === 'ADMIN') return true;
  if (email && ADMIN_EMAILS.length > 0) return ADMIN_EMAILS.includes(email.toLowerCase());
  return false;
}

export default function DemoRouteBar() {
  const { user, profile } = useAuth();
  const [demoAssetId, setDemoAssetId] = useState<string | null>(
    process.env.NEXT_PUBLIC_DEMO_ASSET_ID ?? null
  );

  useEffect(() => {
    if (demoAssetId) return;
    fetch('/api/market/popular?limit=1', { cache: 'no-store' })
      .then((r) => r.json())
      .then((j) => {
        const id = j?.items?.[0]?.id;
        if (id) setDemoAssetId(id);
      })
      .catch(() => {});
  }, [demoAssetId]);

  const showCompliance = isAdmin(profile, user?.email ?? null);

  const links = [
    { href: '/engine-demo', label: 'Engine' },
    { href: demoAssetId ? `/market/${demoAssetId}` : '/market', label: 'Asset' },
    { href: '/creator/upload', label: 'Creator' },
    ...(showCompliance ? [{ href: '/compliance', label: 'Compliance' }] : []),
  ];

  return (
    <div
      className="sticky top-0 left-0 right-0 h-11 flex items-center gap-2 overflow-x-auto no-scrollbar z-[60]"
      style={{
        backgroundColor: '#161B22',
        borderBottom: '1px solid #21262D',
      }}
    >
      <span
        className="shrink-0 px-3 py-1.5 text-xs font-bold"
        style={{ color: '#8B949E', backgroundColor: '#21262D' }}
      >
        DEMO
      </span>
      <div className="flex items-center gap-1 shrink-0 pr-4">
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="px-3 py-1.5 text-sm font-medium rounded-lg transition hover:opacity-90"
            style={{ color: '#E6EDF3', backgroundColor: 'rgba(255,255,255,0.06)' }}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import HomeV4 from '@/components/home/HomeV4';
import { useAssetFromLedger } from '@/hooks/useAssetFromLedger';

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const isLoggedIn = !!user;
  const { data: assetData, loading: assetLoading } = useAssetFromLedger(isLoggedIn);

  return (
    <HomeV4
      assetData={assetData}
      assetLoading={isLoggedIn && (authLoading || assetLoading)}
      isLoggedIn={isLoggedIn}
      demoMode={false}
      showBottomNav
    />
  );
}

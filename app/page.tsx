'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import HomeView from '@/components/home/HomeView';
import { useAssetFromLedger } from '@/hooks/useAssetFromLedger';

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const isLoggedIn = !!user;
  const { data: assetData, loading: assetLoading } = useAssetFromLedger(isLoggedIn);

  return (
    <HomeView
      assetData={assetData}
      assetLoading={isLoggedIn && (authLoading || assetLoading)}
      isLoggedIn={isLoggedIn}
      demoMode={false}
      showBottomNav
    />
  );
}

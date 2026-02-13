'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { useStore } from '@/context/StoreContext';
import HomeView from '@/components/home/HomeView';

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const { userCash, holdings, getTotalAssets, getTotalReturn } = useStore();

  const isLoggedIn = !!user;

  // user 있을 때만 자산 데이터 계산
  const assetData = isLoggedIn
    ? (() => {
        const totalAssets = getTotalAssets();
        const { amount: returnAmount, rate: returnRate } = getTotalReturn();
        const holdingsValue = holdings.reduce((s, h) => s + h.currentValue, 0);
        return {
          totalAssets,
          userCash,
          holdingsValue,
          returnAmount,
          returnRate,
          dailyChange: 0,
        };
      })()
    : null;

  return (
    <HomeView
      assetData={assetData}
      assetLoading={isLoggedIn && authLoading}
      isLoggedIn={isLoggedIn}
      demoMode={false}
      showBottomNav
    />
  );
}

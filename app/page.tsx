'use client';

import { useStore } from '@/context/StoreContext';
import HomeView from '@/components/home/HomeView';

export default function HomePage() {
  const { userCash, holdings, getTotalAssets, getTotalReturn } = useStore();
  const totalAssets = getTotalAssets();
  const { amount: returnAmount, rate: returnRate } = getTotalReturn();
  const holdingsValue = holdings.reduce((s, h) => s + h.currentValue, 0);

  return (
    <HomeView
      assetData={{
        totalAssets,
        userCash,
        holdingsValue,
        returnAmount,
        returnRate,
      }}
      demoMode={false}
      showBottomNav
    />
  );
}

'use client';

import HomeView from '@/components/home/HomeView';

/** 공개 모델하우스 — 로그인 없이 접근 가능 */
const DEMO_ASSET: { totalAssets: number; userCash: number; holdingsValue: number; returnAmount: number; returnRate: number } = {
  totalAssets: 0,
  userCash: 0,
  holdingsValue: 0,
  returnAmount: 0,
  returnRate: 0,
};

export default function DemoPage() {
  return (
    <HomeView
      assetData={DEMO_ASSET}
      demoMode
      showBottomNav
    />
  );
}

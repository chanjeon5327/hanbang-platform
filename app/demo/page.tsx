'use client';

import HomeView from '@/components/home/HomeView';

/** 공개 모델하우스 — 로그인 없이 접근 가능 */
export default function DemoPage() {
  return (
    <HomeView
      assetData={null}
      isLoggedIn={false}
      demoMode
      showBottomNav
    />
  );
}

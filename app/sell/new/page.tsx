'use client';

import { useAuthGuard } from '@/hooks/useAuthGuard';

export default function SellNewPage() {
  const { checking } = useAuthGuard();

  if (checking) {
    return <p style={{ padding: 24 }}>인증 확인 중...</p>;
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>출품하기</h2>
      {/* 실제 출품 UI */}
    </div>
  );
}

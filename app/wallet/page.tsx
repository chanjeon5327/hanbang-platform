'use client';

import { useState } from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import VirtualChargeButton from '@/components/wallet/VirtualChargeButton';

export default function WalletPage() {
  const { checking } = useAuthGuard();

  // ✅ 지갑 잔액을 state로 선언
  const [balance, setBalance] = useState(100_000);

  if (checking) {
    return <p style={{ padding: 24 }}>인증 확인 중...</p>;
  }

  const handleVirtualCharge = async (amount: number) => {
    // 실제 DB 업데이트 자리에 지금은 state만 변경
    await new Promise((r) => setTimeout(r, 800));

    setBalance((prev) => prev + amount); // ✅ 여기서 “숨 쉼”
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>내 지갑</h2>

      <p>
        가상 잔액: <strong>{balance.toLocaleString()}원</strong>
      </p>

      <VirtualChargeButton onCharge={handleVirtualCharge} />
    </div>
  );
}

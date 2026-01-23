"use client";

import { useState } from "react";

export default function WalletView() {
  // ✅ 지금 단계에서는 실제 Wagmi 대신 UX 검증용 상태
  const [walletConnected, setWalletConnected] = useState(false);

  // 로그인 여부는 page.tsx에서 이미 보장됨

  // 지갑 미연결 → CTA
  if (!walletConnected) {
    return (
      <section style={{ padding: 16 }}>
        <h2>지갑 연결</h2>
        <p>자산을 확인하려면 지갑을 연결하세요.</p>

        <button
          onClick={() => setWalletConnected(true)}
          style={{
            marginTop: 12,
            padding: "10px 14px",
            border: "1px solid #000",
          }}
        >
          지갑 연결하기
        </button>
      </section>
    );
  }

  // 지갑 연결됨 → 자산 요약
  return (
    <section style={{ padding: 16 }}>
      <h2>내 자산 요약</h2>
      <div>총 자산: ₩0</div>
    </section>
  );
}

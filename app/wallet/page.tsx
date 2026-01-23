"use client";

import WalletView from "@/components/wallet/WalletView";

export default function WalletPage() {
  return (
    <div style={{ padding: 24, border: "4px solid red" }}>
      <h1>여기는 /wallet 페이지입니다</h1>
      <WalletView />
    </div>
  );
}

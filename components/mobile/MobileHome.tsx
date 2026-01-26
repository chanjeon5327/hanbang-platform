'use client';

import { useWallet } from '@/context/WalletContext';

export default function MobileHome() {
  const { balanceKRW, loading } = useWallet();

  return (
    <section className="p-4">
      <div className="rounded-xl border p-4">
        <p className="text-sm text-gray-500">내 자산 (KRW)</p>
        <p className="mt-2 text-2xl font-bold">
          {loading ? '—' : balanceKRW.toLocaleString()}
        </p>
      </div>
    </section>
  );
}

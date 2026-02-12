'use client';

import Link from 'next/link';

const UPBIT = { bg: '#0d0d0d', panel: '#161616', border: '#2b2b2b', bid: '#1e88e5', text: '#e0e0e0', dim: '#8e8e8e' };

export default function DepositPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: UPBIT.bg }}>
      <header className="sticky top-0 z-50 border-b px-4 py-3 flex items-center" style={{ backgroundColor: UPBIT.bg, borderColor: UPBIT.border }}>
        <Link href="/wallet" className="text-sm" style={{ color: UPBIT.dim }}>‹ 뒤로</Link>
        <h1 className="flex-1 text-center text-[16px] font-bold" style={{ color: UPBIT.text }}>KRW 입금</h1>
        <span className="w-6" />
      </header>
      <main className="px-4 py-8">
        <div className="rounded-[12px] border p-6 text-center" style={{ backgroundColor: UPBIT.panel, borderColor: UPBIT.border }}>
          <p className="text-[15px]" style={{ color: UPBIT.text }}>입금 기능은 준비 중입니다.</p>
          <p className="text-[13px] mt-2" style={{ color: UPBIT.dim }}>곧 업데이트될 예정입니다.</p>
        </div>
      </main>
    </div>
  );
}

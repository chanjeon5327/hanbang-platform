'use client';

import Link from 'next/link';

const UPBIT = { bg: '#0d0d0d', panel: '#161616', border: '#2b2b2b', bid: '#1e88e5', text: '#e0e0e0', dim: '#8e8e8e' };

export default function WithdrawPage() {
  return (
    <div style={{ backgroundColor: UPBIT.bg }}>
      <header className="sticky top-0 z-50 border-b px-4 py-3 flex items-center" style={{ backgroundColor: UPBIT.bg, borderColor: UPBIT.border }}>
        <Link href="/wallet" className="text-sm" style={{ color: UPBIT.dim }}>‹ 뒤로</Link>
        <h1 className="flex-1 text-center body font-bold" style={{ color: UPBIT.text }}>KRW 출금</h1>
        <span className="w-6" />
      </header>
      <div className="py-8">
        <div className="rounded-[12px] border p-6 text-center" style={{ backgroundColor: UPBIT.panel, borderColor: UPBIT.border }}>
          <p className="body" style={{ color: UPBIT.text }}>출금 기능은 준비 중입니다.</p>
          <p className="body-sm mt-2" style={{ color: UPBIT.dim }}>곧 업데이트될 예정입니다.</p>
        </div>
      </div>
    </div>
  );
}

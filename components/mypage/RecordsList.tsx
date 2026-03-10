'use client';

import Link from 'next/link';

function Row({ title, href }: { title: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between border-b border-black/10 bg-white px-4 py-3 last:border-0 active:scale-[0.99]"
    >
      <div className="text-[14px] font-semibold text-gray-900">{title}</div>
      <div className="text-gray-400 text-[13px]">›</div>
    </Link>
  );
}

export default function RecordsList() {
  return (
    <section className="px-4">
      <div className="mb-2 text-[14px] font-extrabold text-gray-900">기록</div>
      <div className="rounded-2xl overflow-hidden border border-black/10 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <Row title="주문 내역" href="/mypage/orders" />
        <Row title="정산 내역" href="/mypage/settlements" />
        <Row title="입출금 기록" href="/mypage/ledger" />
      </div>
    </section>
  );
}

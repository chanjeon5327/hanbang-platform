'use client';

import Link from 'next/link';

function Row({ title, href }: { title: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-2xl border border-black/10 bg-white px-4 py-4 active:scale-[0.99]"
    >
      <div className="text-[15px] font-extrabold text-gray-900">{title}</div>
      <div className="text-gray-400">›</div>
    </Link>
  );
}

export default function RecordsList() {
  return (
    <section className="px-4">
      <div className="mb-3 text-[16px] font-extrabold text-gray-900">기록</div>
      <div className="space-y-2">
        <Row title="주문 내역" href="/mypage/orders" />
        <Row title="정산 내역" href="/mypage/settlements" />
        <Row title="입출금 기록" href="/mypage/ledger" />
      </div>
    </section>
  );
}

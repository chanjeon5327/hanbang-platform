'use client';

import Link from 'next/link';

const RECORD_ITEMS = [
  { label: '주문 내역', href: '/mypage/orders' },
  { label: '정산 내역', href: '/mypage/settlements' },
  { label: '입출금 기록', href: '/mypage/ledger' },
] as const;

export default function MyHistory() {
  return (
    <section>
      <h2 className="body-lg font-bold text-[var(--toss-text)] mb-3">기록</h2>
      <div className="bg-white rounded-[16px] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[var(--toss-border)] divide-y divide-[var(--toss-border)]">
        {RECORD_ITEMS.map(({ label, href }) => (
          <Link key={label} href={href} className="block px-4 py-4 flex justify-between items-center hover:bg-[var(--toss-bg)] transition">
            <span className="body font-medium text-[var(--toss-text)]">{label}</span>
            <span className="text-[var(--toss-text-secondary)]">›</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

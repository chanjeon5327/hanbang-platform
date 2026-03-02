'use client';

import Link from 'next/link';

export default function FloatingSupportBubble() {
  return (
    <Link
      href="/support"
      className="fixed right-5 bottom-6 z-50 flex items-center gap-2 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-3 shadow-lg transition"
      aria-label="1:1 문의"
    >
      <span className="text-base">💬</span>
      <span className="text-sm font-extrabold">1:1 문의</span>
    </Link>
  );
}

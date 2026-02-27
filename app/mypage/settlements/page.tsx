'use client';

import Link from 'next/link';

export default function MySettlementsPage() {
  return (
    <div className="mx-auto w-full max-w-[520px] px-4 pb-24 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/mypage" className="text-[13px] font-extrabold text-gray-500">
          ← 마이페이지
        </Link>
      </div>

      <div className="mb-2 text-[18px] font-extrabold text-gray-900">정산 내역</div>
      <div className="rounded-2xl border border-black/10 bg-white p-4 text-[13px] font-bold text-gray-500">
        배당/정산 예정이 없습니다.
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#0B1120]">
      <div className="max-w-3xl mx-auto px-5 sm:px-6 py-12">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-[-0.4px]">1:1 문의</h1>
        <p className="mt-2 text-sm text-black/60">
          운영/거래/정산/계정 관련 문의를 남겨 주세요. (추후 실시간 채팅/티켓으로 연결)
        </p>

        <div className="mt-8 rounded-2xl border border-black/10 bg-white p-6 shadow-[0_6px_20px_rgba(0,0,0,0.05)]">
          <div className="text-sm font-extrabold">문의 채널</div>
          <ul className="mt-3 space-y-2 text-sm text-black/65">
            <li>• 이메일: support@hanbang.app (예시)</li>
            <li>• 운영시간: 10:00 ~ 18:00</li>
            <li>• 긴급: 거래/정산 오류는 &quot;스크린샷 + URL + 시간&quot;을 함께</li>
          </ul>

          <div className="mt-6 flex gap-3">
            <Link href="/" className="px-5 py-3 rounded-xl bg-black/5 hover:bg-black/10 border border-black/10 text-sm font-bold transition">
              홈으로
            </Link>
            <Link href="/market" className="px-5 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-extrabold transition">
              마켓으로
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';

export default function HeroCinematic() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* coin.mp4 미포함 — 시네마틱 그라데이션 배경 */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#0B1224] to-[#1e1b4b]"
        aria-hidden
      />

      <div className="absolute inset-0 bg-black/50" aria-hidden />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 pt-20 text-center translate-y-16 md:translate-y-20">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center text-center">
          <div className="flex w-full min-w-0 justify-center overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <h1 className="whitespace-nowrap text-2xl font-bold leading-tight text-white sm:text-3xl md:text-5xl">
              내가 좋아하는 크리에이터에게 투자하고
            </h1>
          </div>

          <p className="mt-4 text-xl font-semibold text-white md:text-3xl">매달 수익을 받아요</p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/market"
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500"
            >
              투자 시작
            </Link>
            <Link
              href="/content"
              className="rounded-xl border border-white/30 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              개념 보기
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

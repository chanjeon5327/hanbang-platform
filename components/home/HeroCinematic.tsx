'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function HeroCinematic() {
  const [videoFailed, setVideoFailed] = useState(false);

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* 데스크탑: 압축 히어로 영상 (실패·모바일은 그라데이션만) */}
      {!videoFailed ? (
        <video
          className="absolute inset-0 z-0 hidden h-full w-full object-cover md:block pointer-events-none"
          src="/hero-desktop.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden
          onError={() => setVideoFailed(true)}
        />
      ) : null}

      {/* 모바일: 항상 기존 시네마틱 그라데이션 */}
      <div
        className="absolute inset-0 z-[1] bg-gradient-to-br from-[#0f172a] via-[#0B1224] to-[#1e1b4b] pointer-events-none md:hidden"
        aria-hidden
      />

      {/* 데스크탑: 영상 실패 시 기존 그라데이션 / 성공 시 가독용 얕은 스크림 */}
      {videoFailed ? (
        <div
          className="absolute inset-0 z-[1] hidden bg-gradient-to-br from-[#0f172a] via-[#0B1224] to-[#1e1b4b] md:block pointer-events-none"
          aria-hidden
        />
      ) : (
        <div
          className="absolute inset-0 z-[1] hidden bg-gradient-to-b from-black/50 via-black/25 to-black/55 md:block pointer-events-none"
          aria-hidden
        />
      )}

      <div className="absolute inset-0 z-[1] bg-black/50 pointer-events-none md:bg-black/35" aria-hidden />

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

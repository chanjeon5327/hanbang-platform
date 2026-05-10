'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function HeroCinematic() {
  const [mobileVideoFailed, setMobileVideoFailed] = useState(false);
  const [desktopVideoFailed, setDesktopVideoFailed] = useState(false);

  return (
    <section className="relative flex w-full flex-col overflow-hidden bg-black md:block md:bg-transparent h-[calc(100svh-120px)] min-h-[300px] max-h-[820px] md:h-screen md:min-h-0 md:max-h-none">
      {/* 모바일: 세로 히어로 — 코인 전체가 보이도록 contain + 레터박스 */}
      {!mobileVideoFailed ? (
        <video
          className="absolute inset-0 z-0 block h-full w-full object-contain object-center pointer-events-none md:hidden [filter:brightness(1.32)_contrast(1.06)_saturate(1.1)]"
          src="/hero-mobile.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden
          onError={() => setMobileVideoFailed(true)}
        />
      ) : null}

      {/* 데스크탑: 기존 가로 히어로 영상 */}
      {!desktopVideoFailed ? (
        <video
          className="absolute inset-0 z-0 hidden h-full w-full object-cover pointer-events-none md:block md:[filter:brightness(1.45)_contrast(1.08)_saturate(1.12)]"
          src="/hero-desktop.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden
          onError={() => setDesktopVideoFailed(true)}
        />
      ) : null}

      {/* 모바일: 영상 실패 시 그라데이션 / 성공 시 매우 얕은 스크림 + 카피용 radial */}
      {mobileVideoFailed ? (
        <div
          className="absolute inset-0 z-[1] bg-gradient-to-br from-[#0f172a] via-[#0B1224] to-[#1e1b4b] pointer-events-none md:hidden"
          aria-hidden
        />
      ) : (
        <>
          <div
            className="absolute inset-0 z-[1] bg-gradient-to-b from-black/12 via-transparent to-black/18 pointer-events-none md:hidden"
            aria-hidden
          />
          <div
            className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_95%_65%_at_50%_38%,rgba(0,0,0,0.38)_0%,transparent_72%)] pointer-events-none md:hidden"
            aria-hidden
          />
        </>
      )}

      {/* 데스크탑: 영상 실패 시 기존 그라데이션 / 성공 시 가독용 radial */}
      {desktopVideoFailed ? (
        <div
          className="absolute inset-0 z-[1] hidden bg-gradient-to-br from-[#0f172a] via-[#0B1224] to-[#1e1b4b] md:block pointer-events-none"
          aria-hidden
        />
      ) : (
        <div
          className="absolute inset-0 z-[1] hidden bg-[radial-gradient(ellipse_85%_58%_at_50%_42%,rgba(15,23,42,0.42)_0%,transparent_74%)] md:block pointer-events-none"
          aria-hidden
        />
      )}

      {/* 모바일: 얕은 전역 딤 / 데스크탑: 기존 */}
      <div className="absolute inset-0 z-[1] bg-black/25 pointer-events-none md:bg-black/22" aria-hidden />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center px-4 pb-24 pt-14 text-center md:absolute md:inset-0 md:flex md:min-h-0 md:flex-col md:items-center md:justify-center md:translate-y-20 md:px-6 md:pb-0 md:pt-20">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center text-center">
          <h1 className="mx-auto max-w-[92vw] break-keep px-1 text-center text-[clamp(1.65rem,7.5vw,2.15rem)] font-bold leading-tight text-white sm:text-3xl md:whitespace-nowrap md:px-0 md:text-5xl [text-shadow:0_1px_2px_rgba(0,0,0,0.75),0_2px_12px_rgba(0,0,0,0.35)] md:[text-shadow:0_1px_3px_rgba(0,0,0,0.85),0_2px_20px_rgba(0,0,0,0.35)]">
            내가 좋아하는 크리에이터에게 투자하고
          </h1>

          <p className="mx-auto mt-3 max-w-[92vw] break-keep px-1 text-center text-[clamp(1.125rem,5vw,1.45rem)] font-semibold text-white md:mt-4 md:text-3xl [text-shadow:0_1px_2px_rgba(0,0,0,0.7),0_2px_10px_rgba(0,0,0,0.3)] md:[text-shadow:0_1px_2px_rgba(0,0,0,0.8),0_2px_14px_rgba(0,0,0,0.3)]">
            매달 수익을 받아요
          </p>

          <div className="mt-6 flex w-full max-w-[92vw] flex-wrap items-center justify-center gap-2 px-1 sm:gap-3 md:mt-8 md:max-w-none md:gap-4 md:px-0">
            <Link
              href="/market"
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 md:px-6 md:py-3 md:text-base"
            >
              투자 시작
            </Link>
            <Link
              href="/content"
              className="rounded-xl border border-white/30 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 md:px-6 md:py-3 md:text-base"
            >
              개념 보기
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

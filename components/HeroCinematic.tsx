'use client';

import React, { useEffect, useRef } from 'react';

type Props = {
  headline: React.ReactNode;
  subline?: string;
  sublineTop?: string;
  sublineBottom?: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
};

export default function HeroCinematic({
  headline,
  subline,
  sublineTop,
  sublineBottom,
  primaryCta,
  secondaryCta,
}: Props) {
  const sublineText = subline ?? [sublineTop, sublineBottom].filter(Boolean).join('\n');
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const LIMIT = 59;

    const onTimeUpdate = () => {
      // 59초 이후는 절대 재생하지 않음: 즉시 0초로 되감기 + 재생 유지
      if (v.currentTime >= LIMIT) {
        v.currentTime = 0;
        void v.play().catch(() => {});
      }
    };

    v.addEventListener('timeupdate', onTimeUpdate);
    return () => v.removeEventListener('timeupdate', onTimeUpdate);
  }, []);

  return (
    <section className="relative overflow-hidden rounded-3xl border bg-black">
      {/* ✅ 높이 확장: 첫인상 압도감 */}
      <div className="relative min-h-[360px] sm:min-h-[430px] lg:min-h-[500px]">
        {/* Video Background */}
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          playsInline
          preload="auto"
          controls={false}
        >
          <source src="/hero/hero.mp4" type="video/mp4" />
        </video>

        {/* Overlay for readability (너무 검게 덮지 않기) */}
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/10 to-black/45" />

        {/* CTA: 히어로 맨 하단 중앙 */}
        {(primaryCta || secondaryCta) && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 justify-center">
            {primaryCta && (
              <a
                href={primaryCta.href}
                className="rounded-2xl bg-blue-600 px-5 py-3 text-[14px] font-extrabold text-white shadow-sm active:scale-[0.99]"
              >
                {primaryCta.label}
              </a>
            )}
            {secondaryCta && (
              <a
                href={secondaryCta.href}
                className="rounded-2xl border border-white/35 bg-white/10 px-5 py-3 text-[14px] font-extrabold text-white backdrop-blur active:scale-[0.99]"
              >
                {secondaryCta.label}
              </a>
            )}
          </div>
        )}

        {/* Content */}
        <div className="relative px-6 py-10 sm:px-10 sm:py-16">
          <div className="max-w-[720px] mx-auto flex flex-col items-center text-center">
            <h1 className="text-[28px] font-extrabold leading-tight tracking-[-0.02em] text-white sm:text-[44px] text-center">
              {headline}
            </h1>

            {sublineText && (
              <p className="mt-4 text-[14px] font-semibold text-white/90 sm:text-[16px] whitespace-pre-line text-center">
                {sublineText}
              </p>
            )}

            {/* 개발 확인용 (주석)
              - 영상 직접 확인: http://localhost:3000/hero/hero.mp4
              - 59초 되면 0초로 돌아가야 함
            */}
          </div>
        </div>
      </div>
    </section>
  );
}

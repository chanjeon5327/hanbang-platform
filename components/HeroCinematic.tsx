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
    <section
      className="relative overflow-hidden rounded-3xl border"
      style={{
        borderColor: 'rgba(99,102,241,0.25)',
        background: 'linear-gradient(135deg, #0f0c29 0%, #1a1040 40%, #0d1b3e 100%)',
        boxShadow: '0 24px 64px rgba(37,99,235,0.18), 0 4px 16px rgba(0,0,0,0.3)',
      }}
    >
      <div className="relative min-h-[340px] sm:min-h-[400px] lg:min-h-[460px]">
        {/* Video Background */}
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover opacity-40"
          autoPlay
          muted
          playsInline
          preload="auto"
          controls={false}
        >
          <source src="/hero/hero.mp4" type="video/mp4" />
        </video>

        {/* 블루/퍼플 금융형 그라디언트 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/70 via-blue-950/40 to-purple-950/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* 미세 노이즈 질감 (border shimmer) */}
        <div
          className="absolute inset-0 rounded-3xl"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 50%, rgba(99,102,241,0.06) 100%)',
          }}
        />

        {/* CTA: 히어로 맨 하단 중앙 */}
        {(primaryCta || secondaryCta) && (
          <div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex gap-3 justify-center">
            {primaryCta && (
              <a
                href={primaryCta.href}
                className="rounded-2xl px-5 py-2.5 text-[14px] font-extrabold text-white shadow-lg active:scale-[0.99] transition"
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                  boxShadow: '0 8px 24px rgba(37,99,235,0.40)',
                }}
              >
                {primaryCta.label}
              </a>
            )}
            {secondaryCta && (
              <a
                href={secondaryCta.href}
                className="rounded-2xl border border-white/25 bg-white/10 px-5 py-2.5 text-[14px] font-extrabold text-white backdrop-blur active:scale-[0.99] transition hover:bg-white/15"
              >
                {secondaryCta.label}
              </a>
            )}
          </div>
        )}

        {/* Content */}
        <div className="relative px-6 py-10 sm:px-10 sm:py-14">
          <div className="max-w-[720px] mx-auto flex flex-col items-center text-center">
            <h1
              className="text-[26px] font-extrabold leading-tight tracking-[-0.02em] text-white sm:text-[40px] text-center"
              style={{ textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}
            >
              {headline}
            </h1>

            {sublineText && (
              <p
                className="mt-3 text-[13px] font-medium text-white/80 sm:text-[15px] whitespace-pre-line text-center"
                style={{ textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}
              >
                {sublineText}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

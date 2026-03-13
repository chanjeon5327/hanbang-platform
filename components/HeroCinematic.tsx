'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';

type Props = {
  headline: React.ReactNode;
  subline?: string;
  sublineTop?: string;
  sublineBottom?: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
};

const TRUST_STATS = [
  { value: '3,418명', label: '투자 중' },
  { value: '188개', label: '수익 종목' },
  { value: '연 평균 +12.4%', label: '수익률' },
];

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
      {/* 영상 배경 */}
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover opacity-28"
        autoPlay
        muted
        playsInline
        preload="auto"
        controls={false}
      >
        <source src="/hero/hero.mp4" type="video/mp4" />
      </video>

      {/* 그라디언트 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/80 via-blue-950/50 to-purple-950/70" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/10" />
      <div
        className="absolute inset-0 rounded-3xl"
        style={{
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 50%, rgba(99,102,241,0.05) 100%)',
        }}
      />

      {/* 콘텐츠 */}
      <div className="relative px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
        <div className="max-w-[780px] mx-auto flex flex-col items-center text-center">

          {/* 브랜드 식별 필 */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 backdrop-blur-sm">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[12px] font-bold text-white/85 tracking-wide">
              HANBANG · 크리에이터 IP 투자 플랫폼
            </span>
          </div>

          {/* 헤드라인 */}
          <h1
            className="text-[24px] sm:text-[38px] lg:text-[46px] font-extrabold leading-[1.24] tracking-[-0.02em] text-white"
            style={{ textShadow: '0 2px 16px rgba(0,0,0,0.6)' }}
          >
            {headline}
          </h1>

          {/* 서브라인 */}
          {sublineText && (
            <p
              className="mt-4 text-[14px] sm:text-[16px] text-white/72 leading-relaxed whitespace-pre-line"
              style={{ textShadow: '0 1px 8px rgba(0,0,0,0.45)' }}
            >
              {sublineText}
            </p>
          )}

          {/* CTA 버튼 */}
          {(primaryCta || secondaryCta) && (
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              {primaryCta && (
                <Link
                  href={primaryCta.href}
                  className="rounded-2xl px-6 py-3 text-[15px] font-extrabold text-white transition active:scale-[0.98] hover:brightness-110"
                  style={{
                    background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                    boxShadow: '0 8px 24px rgba(37,99,235,0.45)',
                  }}
                >
                  {primaryCta.label}
                </Link>
              )}
              {secondaryCta && (
                <Link
                  href={secondaryCta.href}
                  className="rounded-2xl border border-white/25 bg-white/10 px-6 py-3 text-[15px] font-extrabold text-white backdrop-blur-sm transition active:scale-[0.98] hover:bg-white/18"
                >
                  {secondaryCta.label}
                </Link>
              )}
            </div>
          )}

          {/* 신뢰 지표 바 */}
          <div className="mt-8 pt-6 border-t border-white/10 w-full flex flex-wrap justify-center gap-6 sm:gap-12">
            {TRUST_STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-0.5">
                <div
                  className="text-[18px] sm:text-[22px] font-extrabold text-white tabular-nums"
                  style={{ textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}
                >
                  {stat.value}
                </div>
                <div className="text-[11px] sm:text-[12px] text-white/55">{stat.label}</div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

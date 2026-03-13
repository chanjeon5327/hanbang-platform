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
  { value: '연 +12.4%', label: '평균 수익률' },
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
        borderColor: 'rgba(99,102,241,0.38)',
        /*
         * 배경 베이스: near-black → 보라/블루 중간톤으로 확실히 올림
         * 색의 층이 눈에 보이도록 채도를 높임
         */
        background: 'linear-gradient(135deg, #1e1a4a 0%, #28206e 40%, #1a2e62 100%)',
        boxShadow: '0 32px 72px rgba(37,99,235,0.24), 0 4px 16px rgba(0,0,0,0.22)',
      }}
    >
      {/* 영상 배경 — opacity 올려서 실제로 보이게 */}
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover opacity-[0.35]"
        autoPlay
        muted
        playsInline
        preload="auto"
        controls={false}
      >
        <source src="/hero/hero.mp4" type="video/mp4" />
      </video>

      {/* 오버레이 1: 방향성 그라디언트 — 훨씬 가볍게 */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-blue-900/24 to-purple-900/35" />

      {/* 오버레이 2: 하단 암전 최소화 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/28 via-transparent to-transparent" />

      {/* 중앙 ambient radial — 더 크고 더 밝게 */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 90% 70% at 50% 50%, rgba(99,102,241,0.32) 0%, rgba(37,99,235,0.12) 55%, transparent 75%)',
        }}
      />

      {/* 상단 accent glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 40% 20%, rgba(139,92,246,0.22) 0%, transparent 65%)',
        }}
      />

      {/* 미세 질감 shimmer */}
      <div
        className="absolute inset-0 rounded-3xl"
        style={{
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.045) 0%, transparent 45%, rgba(99,102,241,0.10) 100%)',
        }}
      />

      {/* 하단 보더 하이라이트 */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.65) 30%, rgba(37,99,235,0.65) 70%, transparent 100%)',
        }}
      />

      {/* 콘텐츠 */}
      <div className="relative min-h-[460px] sm:min-h-[500px] lg:min-h-[540px] flex flex-col justify-center px-6 py-12 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
        <div className="max-w-[800px] mx-auto flex flex-col items-center text-center">

          {/* 브랜드 식별 필 */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/[0.14] px-4 py-1.5 backdrop-blur-sm">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[12px] font-bold text-white tracking-[0.04em] uppercase">
              Hanbang · 크리에이터 IP 투자 플랫폼
            </span>
          </div>

          {/* 헤드라인 */}
          <h1
            className="text-[26px] sm:text-[40px] lg:text-[50px] font-extrabold leading-[1.22] tracking-[-0.025em] text-white"
            style={{ textShadow: '0 2px 18px rgba(0,0,0,0.40), 0 0 80px rgba(99,102,241,0.28)' }}
          >
            {headline}
          </h1>

          {/* 서브라인 */}
          {sublineText && (
            <p
              className="mt-4 sm:mt-5 text-[14px] sm:text-[17px] text-white/90 leading-relaxed whitespace-pre-line font-medium"
              style={{ textShadow: '0 1px 8px rgba(0,0,0,0.30)' }}
            >
              {sublineText}
            </p>
          )}

          {/* CTA 버튼 */}
          {(primaryCta || secondaryCta) && (
            <div className="mt-8 sm:mt-10 flex flex-wrap gap-3 justify-center">
              {primaryCta && (
                <Link
                  href={primaryCta.href}
                  className="rounded-2xl px-7 py-3.5 text-[15px] font-extrabold text-white transition active:scale-[0.97] hover:brightness-110"
                  style={{
                    background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                    boxShadow: '0 10px 30px rgba(37,99,235,0.60)',
                  }}
                >
                  {primaryCta.label}
                </Link>
              )}
              {secondaryCta && (
                <Link
                  href={secondaryCta.href}
                  className="rounded-2xl border border-white/38 bg-white/[0.14] px-7 py-3.5 text-[15px] font-extrabold text-white backdrop-blur-sm transition active:scale-[0.97] hover:bg-white/[0.20]"
                >
                  {secondaryCta.label}
                </Link>
              )}
            </div>
          )}

          {/* 신뢰 지표 바 */}
          <div className="mt-10 pt-6 border-t border-white/18 w-full flex items-center justify-center">
            {TRUST_STATS.map((stat, i) => (
              <div
                key={stat.label}
                className={`flex flex-col items-center px-6 sm:px-10 ${
                  i < TRUST_STATS.length - 1 ? 'border-r border-white/22' : ''
                }`}
              >
                <div
                  className="text-[20px] sm:text-[24px] font-extrabold text-white tabular-nums"
                  style={{ textShadow: '0 1px 14px rgba(99,102,241,0.45)' }}
                >
                  {stat.value}
                </div>
                <div className="mt-0.5 text-[11px] sm:text-[12px] text-white/72 tracking-wide">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

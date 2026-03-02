'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './HeroCinematic.module.css';

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function AnimatedNumber({
  value,
  duration = 1200,
  format = (n) => n.toLocaleString('ko-KR'),
}: {
  value: number;
  duration?: number;
  format?: (n: number) => string;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      setDisplay(Math.round(start + (value - start) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [value, duration]);

  return <span className="tabular-nums">{format(display)}</span>;
}

const STATS = [
  { label: '총 거래액', value: 124700000000, format: (n: number) => `${(n / 1e8).toFixed(1)}억원` },
  { label: '오늘 체결 건수', value: 2847, format: (n: number) => `${n.toLocaleString('ko-KR')}건` },
  { label: '월 배당 예상 수익률', value: 12.8, format: (n: number) => `${n.toFixed(1)}%` },
];

export default function HeroCinematic() {
  return (
    <section
      className={`relative min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 md:py-24 ${styles.heroWrap}`}
    >
      <div className={styles.heroBg} aria-hidden />
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h1
          className="text-[2.2rem] md:text-[3.2rem] font-bold tracking-[-1px] text-white leading-tight mb-4"
          style={{ letterSpacing: '-1px' }}
        >
          콘텐츠 조각을 사고팔고, 매달 수익을 받습니다.
        </h1>
        <p className="text-lg md:text-xl text-white/70 mb-12 md:mb-16">
          좋아하는 크리에이터/작품의 수익을 함께 나눕니다.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-10 mb-12 md:mb-16">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                <AnimatedNumber value={s.value} duration={1200} format={s.format} />
              </div>
              <div className="text-sm text-white/60">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center relative z-10">
          <Link
            href="/invest/start"
            className="px-8 py-4 rounded-xl font-semibold text-base bg-[#1D4ED8] hover:bg-[#1E40AF] text-white transition-colors"
          >
            지금 투자 시작
          </Link>
          <Link
            href="/market"
            className="px-8 py-4 rounded-xl font-semibold text-base border border-white/30 hover:bg-white/10 text-white transition-colors"
          >
            마켓 둘러보기
          </Link>
        </div>
      </div>
    </section>
  );
}

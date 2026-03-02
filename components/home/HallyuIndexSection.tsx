'use client';

import UpbitLineBarsChart from '@/components/charts/UpbitLineBarsChart';
import { makeRealisticSeries } from '@/lib/mock/series';

export default function HallyuIndexSection() {
  // 틱 기준(리얼리티 더미): 120 ticks
  const values = makeRealisticSeries({
    seed: 'japan-hallyu-tick',
    points: 120,
    start: 78,
    drift: 0.01,
    vol: 0.9,
    spikeEvery: 19,
  }).map(v => Math.round(v));

  return (
    <section className="px-5 sm:px-6 py-10 sm:py-12 max-w-7xl mx-auto">
      <div className="rounded-2xl border border-black/10 bg-white p-5 sm:p-6 shadow-[0_6px_20px_rgba(0,0,0,0.05)]">
        <UpbitLineBarsChart
          values={values}
          theme="light"
          mode="tick"
          title="일본 · 한류 지수"
          subtitle="틱 기준(위: 추세선, 아래: 변동 띠/바)"
        />
      </div>
    </section>
  );
}

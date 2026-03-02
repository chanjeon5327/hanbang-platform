'use client';

import { useMemo, useState } from 'react';
import UpbitLineBarsChart from '@/components/charts/UpbitLineBarsChart';
import { makeRealisticSeries } from '@/lib/mock/series';

type TF = 'tick60' | 's30' | 'm1' | 'h1' | 'd1' | 'w1';

const TF_LABEL: Record<TF, string> = {
  tick60: '60틱',
  s30: '30초',
  m1: '1분',
  h1: '1시간',
  d1: '1일',
  w1: '1주',
};

function TimeTabs({ value, onChange }: { value: TF; onChange: (v: TF) => void }) {
  const items: TF[] = ['tick60', 's30', 'm1', 'h1', 'd1', 'w1'];
  return (
    <div className="inline-flex rounded-xl border border-black/10 bg-white p-1">
      {items.map((k) => (
        <button
          key={k}
          onClick={() => onChange(k)}
          className={`px-3 py-2 rounded-lg text-sm font-extrabold transition ${
            value === k ? 'bg-[#2563EB] text-white' : 'text-black/60 hover:text-black'
          }`}
        >
          {TF_LABEL[k]}
        </button>
      ))}
    </div>
  );
}

export default function HallyuIndexSection() {
  // 기본값: 60틱
  const [tf, setTf] = useState<TF>('tick60');

  const { values, mode } = useMemo(() => {
    if (tf === 'tick60') {
      return {
        mode: 'tick' as const,
        values: makeRealisticSeries({ seed: 'hallyu-tick60', points: 60, start: 78, drift: 0.02, vol: 1.0, spikeEvery: 13 }).map(v => Math.round(v)),
      };
    }
    if (tf === 's30') {
      return {
        mode: 'sec' as const,
        values: makeRealisticSeries({ seed: 'hallyu-s30', points: 30, start: 78, drift: 0.03, vol: 1.1, spikeEvery: 9 }).map(v => Math.round(v)),
      };
    }
    if (tf === 'm1') {
      return {
        mode: 'minute' as const,
        values: makeRealisticSeries({ seed: 'hallyu-m1', points: 60, start: 78, drift: 0.03, vol: 1.1, spikeEvery: 14 }).map(v => Math.round(v)),
      };
    }
    if (tf === 'h1') {
      return {
        mode: 'hour' as const,
        values: makeRealisticSeries({ seed: 'hallyu-h1', points: 60, start: 78, drift: 0.01, vol: 0.9, spikeEvery: 17 }).map(v => Math.round(v)),
      };
    }
    if (tf === 'd1') {
      return {
        mode: 'day' as const,
        values: makeRealisticSeries({ seed: 'hallyu-d1', points: 30, start: 78, drift: 0.05, vol: 1.0, spikeEvery: 9 }).map(v => Math.round(v)),
      };
    }
    return {
      mode: 'week' as const,
      values: makeRealisticSeries({ seed: 'hallyu-w1', points: 26, start: 78, drift: 0.08, vol: 1.2, spikeEvery: 6 }).map(v => Math.round(v)),
    };
  }, [tf]);

  return (
    <section className="px-5 sm:px-6 py-10 sm:py-12 max-w-7xl mx-auto">
      <div className="rounded-2xl border border-black/10 bg-white p-5 sm:p-6 shadow-[0_6px_20px_rgba(0,0,0,0.05)]">
        <div className="flex items-end justify-between gap-3 mb-4">
          <div>
            <div className="text-xl sm:text-2xl font-extrabold tracking-[-0.3px]">한류지수</div>
            <div className="text-sm text-black/55 mt-1">TIP: 30초는 빠른 변동 확인용</div>
          </div>
          <TimeTabs value={tf} onChange={setTf} />
        </div>

        <UpbitLineBarsChart values={values} theme="light" mode={mode} />
      </div>
    </section>
  );
}

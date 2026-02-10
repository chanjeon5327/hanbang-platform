'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createChart,
  ColorType,
  CrosshairMode,
  CandlestickSeries,
} from 'lightweight-charts';

type TF = '1D' | '1W' | '1M';

export default function MobilePriceChart() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [tf, setTf] = useState<TF>('1D');

  useEffect(() => {
    if (!ref.current) return;

    const chart = createChart(ref.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#ffffff' },
        textColor: '#111827',
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: '#f3f4f6' },
      },
      crosshair: { mode: CrosshairMode.Normal },
      height: 220,
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#2563eb',
      downColor: '#dc2626',
      wickUpColor: '#2563eb',
      wickDownColor: '#dc2626',
      borderVisible: false,
    });

    // 🔹 더미 → 이후 Supabase RPC로 교체
    candleSeries.setData([
      { time: '2024-01-01', open: 12000, high: 12300, low: 11800, close: 12100 },
      { time: '2024-01-02', open: 12100, high: 12500, low: 12000, close: 12400 },
      { time: '2024-01-03', open: 12400, high: 12600, low: 12200, close: 12300 },
      { time: '2024-01-04', open: 12300, high: 12700, low: 12200, close: 12600 },
      { time: '2024-01-05', open: 12600, high: 12800, low: 12400, close: 12700 },
    ]);

    chart.timeScale().fitContent();

    return () => chart.remove();
  }, [tf]);

  return (
    <section className="px-4 mt-4">
      <div ref={ref} className="w-full h-[220px]" />
      <div className="flex gap-2 mt-2">
        {(['1D', '1W', '1M'] as TF[]).map((k) => (
          <button
            key={k}
            onClick={() => setTf(k)}
            className={`px-3 py-1 rounded-full text-sm border ${
              tf === k ? 'bg-gray-900 text-white' : ''
            }`}
          >
            {k}
          </button>
        ))}
      </div>
    </section>
  );
}

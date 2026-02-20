'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createChart, ColorType, LineSeries, AreaSeries, CrosshairMode } from 'lightweight-charts';

type LineDataPoint = { time: string; value: number };

const TIMEFRAMES = ['tick', '1m', '1h', '1d', '1M'] as const;
type Timeframe = (typeof TIMEFRAMES)[number];

const INDICATORS = ['MA5', 'MA20', 'BB'] as const;
type Indicator = (typeof INDICATORS)[number];

function generatePriceData(
  currentPriceKrw: number,
  seed: number,
  timeframe: Timeframe
): LineDataPoint[] {
  const counts: Record<Timeframe, number> = { tick: 100, '1m': 60, '1h': 48, '1d': 30, '1M': 12 };
  const days = counts[timeframe];
  const now = new Date();
  const data: LineDataPoint[] = [];
  let price = currentPriceKrw * 0.92;
  const volatility = currentPriceKrw * 0.02;
  let r = seed;

  for (let i = days; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    r = (r * 9301 + 49297) % 233280;
    const rand = r / 233280;
    price = price + (rand - 0.48) * volatility;
    price = Math.max(price, currentPriceKrw * 0.85);
    price = Math.min(price, currentPriceKrw * 1.15);
    if (i === 0) price = currentPriceKrw;
    data.push({ time: dateStr, value: Math.round(price) });
  }
  return data;
}

function calculateSMA(data: LineDataPoint[], period: number): LineDataPoint[] {
  const result: LineDataPoint[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) continue;
    let sum = 0;
    for (let j = 0; j < period; j++) sum += data[i - j].value;
    result.push({ time: data[i].time, value: sum / period });
  }
  return result;
}

function calculateBB(data: LineDataPoint[], period = 20): { upper: LineDataPoint[]; lower: LineDataPoint[] } {
  const upper: LineDataPoint[] = [];
  const lower: LineDataPoint[] = [];
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const avg = slice.reduce((s, p) => s + p.value, 0) / period;
    const variance = slice.reduce((s, p) => s + (p.value - avg) ** 2, 0) / period;
    const std = Math.sqrt(variance);
    upper.push({ time: data[i].time, value: avg + 2 * std });
    lower.push({ time: data[i].time, value: avg - 2 * std });
  }
  return { upper, lower };
}

type Props = {
  priceKrw: number;
  loading?: boolean;
  height?: number;
  theme?: 'light' | 'dark';
};

export default function RealPriceChart({ priceKrw, loading, height = 420, theme = 'dark' }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [timeframe, setTimeframe] = useState<Timeframe>('1d');
  const [indicators, setIndicators] = useState<Record<Indicator, boolean>>({
    MA5: false,
    MA20: false,
    BB: false,
  });

  const data = useMemo(
    () =>
      priceKrw > 0
        ? generatePriceData(priceKrw, Math.floor(priceKrw) % 233280 + timeframe.length, timeframe)
        : [],
    [priceKrw, timeframe]
  );

  const sma5 = useMemo(() => calculateSMA(data, 5), [data]);
  const sma20 = useMemo(() => calculateSMA(data, 20), [data]);
  const bb = useMemo(() => calculateBB(data, 20), [data]);

  const isLight = theme === 'light';
  const bgColor = isLight ? '#F9FAFB' : '#1F2937';
  const textColor = isLight ? '#6B7280' : '#9CA3AF';
  const gridColor = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)';

  useEffect(() => {
    if (!ref.current || loading || data.length === 0) return;
    const chart = createChart(ref.current, {
      layout: {
        background: { type: ColorType.Solid, color: bgColor },
        textColor,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: gridColor },
      },
      height,
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          labelVisible: true,
          labelBackgroundColor: '#2563EB',
        },
        horzLine: {
          labelVisible: true,
          labelBackgroundColor: '#2563EB',
        },
      },
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: { top: 0.1, bottom: 0.2 },
      },
      timeScale: { borderVisible: false },
    });

    if (indicators.BB && bb.upper.length > 0) {
      const bandFill = 'rgba(139,92,246,0.18)';
      const upperArea = chart.addSeries(AreaSeries, {
        lineColor: 'transparent',
        topColor: bandFill,
        bottomColor: 'transparent',
        lineWidth: 1,
        lineVisible: false,
        title: 'BB영역',
      });
      upperArea.setData(bb.upper);
      const lowerArea = chart.addSeries(AreaSeries, {
        lineColor: 'transparent',
        topColor: bgColor,
        bottomColor: 'transparent',
        lineWidth: 1,
        lineVisible: false,
        title: 'BB마스크',
      });
      lowerArea.setData(bb.lower);
      const upperSeries = chart.addSeries(LineSeries, {
        color: '#8B5CF6',
        lineWidth: 1,
        title: 'BB상단',
      });
      upperSeries.setData(bb.upper);
      const lowerSeries = chart.addSeries(LineSeries, {
        color: '#8B5CF6',
        lineWidth: 1,
        title: 'BB하단',
      });
      lowerSeries.setData(bb.lower);
    }
    if (indicators.MA20 && sma20.length > 0) {
      const s = chart.addSeries(LineSeries, {
        color: '#10B981',
        lineWidth: 2,
        title: 'MA20',
      });
      s.setData(sma20);
    }
    if (indicators.MA5 && sma5.length > 0) {
      const s = chart.addSeries(LineSeries, {
        color: '#F59E0B',
        lineWidth: 2,
        title: 'MA5',
      });
      s.setData(sma5);
    }

    const mainSeries = chart.addSeries(LineSeries, {
      color: '#2563EB',
      lineWidth: 2,
    });
    mainSeries.setData(data);
    chart.timeScale().fitContent();

    return () => chart.remove();
  }, [data, sma5, sma20, bb, indicators, loading, height, bgColor, textColor, gridColor]);

  const toggleIndicator = (id: Indicator) => {
    setIndicators((p) => ({ ...p, [id]: !p[id] }));
  };

  if (loading) {
    return (
      <div
        style={{
          height,
          background: bgColor,
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: textColor,
        }}
      >
        로딩 중...
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf}
            type="button"
            onClick={() => setTimeframe(tf)}
            style={{
              fontSize: 12,
              padding: '6px 12px',
              border: '1px solid #E5E7EB',
              borderRadius: 20,
              background: timeframe === tf ? '#111827' : '#F9FAFB',
              color: timeframe === tf ? 'white' : '#374151',
              cursor: 'pointer',
            }}
          >
            {tf}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {INDICATORS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => toggleIndicator(id)}
            style={{
              fontSize: 12,
              padding: '6px 12px',
              border: '1px solid #E5E7EB',
              borderRadius: 20,
              background: indicators[id] ? '#111827' : '#F9FAFB',
              color: indicators[id] ? 'white' : '#374151',
              cursor: 'pointer',
            }}
          >
            {id}
          </button>
        ))}
      </div>
      <div ref={ref} style={{ height, borderRadius: 12 }} />
    </div>
  );
}

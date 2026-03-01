'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createChart, ColorType, LineSeries, CrosshairMode } from 'lightweight-charts';
import styles from '@/app/market/[id]/market-detail.module.css';

type LineDataPoint = { time: string; value: number };

const TIMEFRAMES = ['tick', '1d', '1w', '1M', '1Y'] as const;
const TIMEFRAME_LABELS: Record<string, string> = { tick: 'TICK', '1d': '1D', '1w': '1W', '1M': '1M', '1Y': '1Y' };
type Timeframe = (typeof TIMEFRAMES)[number];

const INDICATORS = ['MA5', 'MA20', 'BB'] as const;
type Indicator = (typeof INDICATORS)[number];

function generatePriceData(
  currentPriceKrw: number,
  seed: number,
  timeframe: Timeframe
): LineDataPoint[] {
  const counts: Record<Timeframe, number> = { tick: 100, '1d': 2, '1w': 7, '1M': 30, '1Y': 365 };
  const days = counts[timeframe];
  const now = new Date();
  const basePrice = currentPriceKrw;
  const data: LineDataPoint[] = [];
  let price = basePrice * 0.99;
  const volatility = basePrice * 0.02 * 0.3;
  const drift = basePrice * 0.0002;
  const driftSign = (seed % 2) * 2 - 1;
  const driftPerStep = (driftSign * drift) / (days + 1);
  let r = seed;

  for (let i = days; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    r = (r * 9301 + 49297) % 233280;
    const rand = r / 233280;
    price = price + (rand - 0.48) * volatility + driftPerStep;
    price = Math.max(price, basePrice * 0.97);
    price = Math.min(price, basePrice * 1.03);
    if (i === 0) price = basePrice;
    data.push({ time: dateStr, value: Math.round(price) });
  }

  const values = data.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  if ((max - min) / basePrice > 0.03) {
    const mid = (min + max) / 2;
    const scale = (basePrice * 0.03) / (max - min);
    for (let i = 0; i < data.length; i++) {
      data[i].value = Math.round(mid + (data[i].value - mid) * scale);
    }
    data[data.length - 1].value = Math.round(basePrice);
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
  const [timeframe, setTimeframe] = useState<Timeframe>('tick');
  const [chartPulseActive, setChartPulseActive] = useState(false);
  const prevPriceRef = useRef(priceKrw);
  const lastPulseTimeRef = useRef(0);

  const chartTargetRef = useRef(priceKrw);
  const chartDisplayRef = useRef(priceKrw);
  const lastRoundedRef = useRef(priceKrw);
  const [chartDisplayPrice, setChartDisplayPrice] = useState(priceKrw);

  useEffect(() => {
    if (priceKrw > 0) chartTargetRef.current = priceKrw;
  }, [priceKrw]);

  useEffect(() => {
    if (!loading && priceKrw > 0) {
      chartTargetRef.current = priceKrw;
      chartDisplayRef.current = priceKrw;
      lastRoundedRef.current = priceKrw;
      setChartDisplayPrice(priceKrw);
    }
  }, [loading, priceKrw]);

  useEffect(() => {
    const ALPHA = 0.06;
    let frameId: number;

    function loop() {
      const target = chartTargetRef.current;
      let display = chartDisplayRef.current;

      const delta = target - display;
      display += delta * ALPHA;

      chartDisplayRef.current = display;
      const rounded = Math.round(display);
      if (rounded !== lastRoundedRef.current) {
        lastRoundedRef.current = rounded;
        setChartDisplayPrice(rounded);
        const arr = dataRef.current;
        const lastTime = lastBarTimeRef.current;
        if (arr.length > 0 && lastTime !== null) {
          arr[arr.length - 1].value = rounded;
          mainSeriesRef.current?.update({ time: lastTime, value: rounded });
        }
      }

      frameId = requestAnimationFrame(loop);
    }

    frameId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    if (prevPriceRef.current !== priceKrw && priceKrw > 0) {
      prevPriceRef.current = priceKrw;
      const now = Date.now();
      if (now - lastPulseTimeRef.current >= 300) {
        lastPulseTimeRef.current = now;
        setChartPulseActive(true);
        const t = setTimeout(() => setChartPulseActive(false), 200);
        return () => clearTimeout(t);
      }
    }
    prevPriceRef.current = priceKrw;
  }, [priceKrw]);

  const [indicators, setIndicators] = useState<Record<Indicator, boolean>>({
    MA5: true,
    MA20: false,
    BB: false,
  });

  const dataRef = useRef<LineDataPoint[]>([]);
  const lastBarTimeRef = useRef<string | null>(null);
  const mainSeriesRef = useRef<{ update: (data: LineDataPoint) => void } | null>(null);

  useEffect(() => {
    if (!loading && priceKrw > 0) {
      const initialPrice = chartDisplayRef.current > 0 ? chartDisplayRef.current : priceKrw;
      const initial = generatePriceData(
        initialPrice,
        Math.floor(initialPrice) % 233280 + timeframe.length,
        timeframe
      );
      dataRef.current = initial;
      lastBarTimeRef.current = initial.length > 0 ? initial[initial.length - 1].time : null;
    }
  }, [loading, timeframe]);

  const isLight = theme === 'light';
  const bgColor = isLight ? '#F9FAFB' : '#1F2937';
  const textColor = isLight ? '#6B7280' : '#9CA3AF';
  const gridColor = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)';

  useEffect(() => {
    if (!ref.current || loading || dataRef.current.length === 0) return;
    const data = dataRef.current;
    const sma5 = calculateSMA(data, 5);
    const sma20 = calculateSMA(data, 20);
    const bb = calculateBB(data, 20);

    const chart = createChart(ref.current, {
      layout: {
        background: { type: ColorType.Solid, color: bgColor },
        textColor,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
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
      },
      timeScale: { borderVisible: false },
    });

    if (indicators.MA20 && sma20.length > 0) {
      const s = chart.addSeries(LineSeries, {
        color: '#3b82f6',
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
    if (indicators.BB && bb.upper.length > 0) {
      const su = chart.addSeries(LineSeries, {
        color: 'rgba(139, 92, 246, 0.8)',
        lineWidth: 1,
        title: 'BB 상단',
      });
      su.setData(bb.upper);
      const sl = chart.addSeries(LineSeries, {
        color: 'rgba(139, 92, 246, 0.8)',
        lineWidth: 1,
        title: 'BB 하단',
      });
      sl.setData(bb.lower);
    }

    const mainSeries = chart.addSeries(LineSeries, {
      color: '#2563EB',
      lineWidth: 2,
    });
    mainSeries.setData(data);

    const priceScale = chart.priceScale('right');
    priceScale.applyOptions({
      autoScale: false,
    });

    const allValues: number[] = data.map((d) => d.value);
    if (indicators.MA5 && sma5.length > 0) sma5.forEach((d) => allValues.push(d.value));
    if (indicators.MA20 && sma20.length > 0) sma20.forEach((d) => allValues.push(d.value));
    if (indicators.BB && bb.upper.length > 0) {
      bb.upper.forEach((d) => allValues.push(d.value));
      bb.lower.forEach((d) => allValues.push(d.value));
    }

    const minPrice = Math.min(...allValues);
    const maxPrice = Math.max(...allValues);
    priceScale.setVisibleRange({ from: minPrice, to: maxPrice });

    mainSeriesRef.current = mainSeries;
    chart.timeScale().fitContent();

    return () => {
      mainSeriesRef.current = null;
      chart.remove();
    };
  }, [loading, timeframe, indicators, height, bgColor, textColor, gridColor]);

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
      <div className={styles.compactTabs} style={{ marginBottom: 10 }}>
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf}
            type="button"
            onClick={() => setTimeframe(tf)}
            className={timeframe === tf ? styles.chartTabActive : styles.chartTab}
          >
            {TIMEFRAME_LABELS[tf] ?? tf}
          </button>
        ))}
      </div>
      <div className={styles.compactTabs} style={{ marginBottom: 10 }}>
        {INDICATORS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => toggleIndicator(id)}
            className={indicators[id] ? styles.chartTabActive : styles.chartTab}
          >
            {id}
          </button>
        ))}
      </div>
      <div style={{ position: 'relative' }}>
        <div ref={ref} style={{ height, borderRadius: 12 }} />
        {chartPulseActive && <div className={styles.chartPulse} aria-hidden />}
      </div>
    </div>
  );
}

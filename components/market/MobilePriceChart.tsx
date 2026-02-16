'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createChart,
  ColorType,
  CrosshairMode,
  CandlestickSeries,
  LineSeries,
} from 'lightweight-charts';
import { useTheme } from '@/context/ThemeContext';

type TF = '1s' | '5s' | '1m' | '1h' | '1D' | '1W' | '1M';

type CandleData = { time: string | number; open: number; high: number; low: number; close: number };

// 1초봉: Unix timestamp 1초 간격 (최근 5분 = 300개, 틱거래용)
function get1sData(): CandleData[] {
  const base = Math.floor(Date.now() / 1000) - 300;
  let last = 12300;
  return Array.from({ length: 300 }, (_, i) => {
    const t = base + i;
    const r = () => (Math.random() - 0.5) * 20;
    const open = last;
    const close = last + r();
    last = close;
    const high = Math.max(open, close) + Math.random() * 10;
    const low = Math.min(open, close) - Math.random() * 10;
    return { time: t, open, high, low, close };
  });
}

// 5초봉: Unix timestamp 5초 간격 (최근 30분 = 360개)
function get5sData(): CandleData[] {
  const base = Math.floor(Date.now() / 1000) - 360 * 5;
  let last = 12300;
  return Array.from({ length: 360 }, (_, i) => {
    const t = base + i * 5;
    const r = () => (Math.random() - 0.5) * 50;
    const open = last;
    const close = last + r();
    last = close;
    const high = Math.max(open, close) + Math.random() * 20;
    const low = Math.min(open, close) - Math.random() * 20;
    return { time: t, open, high, low, close };
  });
}

// 1분봉: Unix timestamp 60초 간격 (최근 4시간 = 240개)
function get1mData(): CandleData[] {
  const base = Math.floor(Date.now() / 1000) - 240 * 60;
  let last = 12300;
  return Array.from({ length: 240 }, (_, i) => {
    const t = base + i * 60;
    const r = () => (Math.random() - 0.5) * 200;
    const open = last;
    const close = last + r();
    last = close;
    const high = Math.max(open, close) + Math.random() * 50;
    const low = Math.min(open, close) - Math.random() * 50;
    return { time: t, open, high, low, close };
  });
}

// 1시간봉: Unix timestamp 3600초 간격 (최근 7일 = 168개)
function get1hData(): CandleData[] {
  const base = Math.floor(Date.now() / 1000) - 168 * 3600;
  let last = 12000;
  return Array.from({ length: 168 }, (_, i) => {
    const t = base + i * 3600;
    const r = () => (Math.random() - 0.5) * 300;
    const open = last;
    const close = last + r();
    last = close;
    const high = Math.max(open, close) + Math.random() * 100;
    const low = Math.min(open, close) - Math.random() * 100;
    return { time: t, open, high, low, close };
  });
}

// 일봉
const CANDLE_DATA_1D: CandleData[] = [
  { time: '2024-01-01', open: 12000, high: 12300, low: 11800, close: 12100 },
  { time: '2024-01-02', open: 12100, high: 12500, low: 12000, close: 12400 },
  { time: '2024-01-03', open: 12400, high: 12600, low: 12200, close: 12300 },
  { time: '2024-01-04', open: 12300, high: 12700, low: 12200, close: 12600 },
  { time: '2024-01-05', open: 12600, high: 12800, low: 12400, close: 12700 },
  { time: '2024-01-06', open: 12700, high: 12900, low: 12500, close: 12650 },
  { time: '2024-01-07', open: 12650, high: 12800, low: 12400, close: 12500 },
  { time: '2024-01-08', open: 12500, high: 12700, low: 12300, close: 12450 },
  { time: '2024-01-09', open: 12450, high: 12600, low: 12200, close: 12350 },
  { time: '2024-01-10', open: 12350, high: 12500, low: 12100, close: 12400 },
  { time: '2024-01-11', open: 12400, high: 12600, low: 12250, close: 12550 },
  { time: '2024-01-12', open: 12550, high: 12750, low: 12400, close: 12700 },
  { time: '2024-01-13', open: 12700, high: 12900, low: 12600, close: 12800 },
  { time: '2024-01-14', open: 12800, high: 13000, low: 12650, close: 12750 },
  { time: '2024-01-15', open: 12750, high: 12900, low: 12500, close: 12600 },
  { time: '2024-01-16', open: 12600, high: 12800, low: 12450, close: 12550 },
  { time: '2024-01-17', open: 12550, high: 12700, low: 12350, close: 12480 },
  { time: '2024-01-18', open: 12480, high: 12650, low: 12300, close: 12520 },
  { time: '2024-01-19', open: 12520, high: 12700, low: 12400, close: 12650 },
  { time: '2024-01-20', open: 12650, high: 12850, low: 12550, close: 12800 },
];

function getDataForTf(tf: TF): CandleData[] {
  if (tf === '1s') return get1sData();
  if (tf === '5s') return get5sData();
  if (tf === '1m') return get1mData();
  if (tf === '1h') return get1hData();
  return CANDLE_DATA_1D;
}

function calculateSMA(data: CandleData[], period: number): { time: string | number; value?: number }[] {
  const result: { time: string | number; value?: number }[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push({ time: data[i].time });
    } else {
      let sum = 0;
      for (let j = 0; j < period; j++) sum += data[i - j].close;
      result.push({ time: data[i].time, value: sum / period });
    }
  }
  return result;
}

function calculateRSI(data: CandleData[], period = 14): { time: string | number; value: number }[] {
  const result: { time: string | number; value: number }[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      result.push({ time: data[i].time, value: 50 });
    } else {
      let gains = 0;
      let losses = 0;
      for (let j = 1; j <= period; j++) {
        const change = data[i - j + 1].close - data[i - j].close;
        if (change > 0) gains += change;
        else losses -= change;
      }
      const avgGain = gains / period;
      const avgLoss = losses / period;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      const rsi = 100 - 100 / (1 + rs);
      result.push({ time: data[i].time, value: Math.round(rsi * 10) / 10 });
    }
  }
  return result;
}

type IndicatorId = 'sma5' | 'sma20' | 'rsi';

const INDICATORS: { id: IndicatorId; label: string }[] = [
  { id: 'sma5', label: 'SMA5' },
  { id: 'sma20', label: 'SMA20' },
  { id: 'rsi', label: 'RSI' },
];

const THEME = {
  light: {
    bg: '#f2f4f6',
    text: '#191f28',
    grid: '#e5e8eb',
    bid: '#1e88e5',
    ask: '#e53935',
    sma5: '#8b5cf6',
    sma20: '#f59e0b',
    rsi: '#10b981',
  },
  dark: {
    bg: '#0d0d0d',
    text: '#e0e0e0',
    grid: '#2b2b2b',
    bid: '#1e88e5',
    ask: '#e53935',
    sma5: '#a78bfa',
    sma20: '#fbbf24',
    rsi: '#34d399',
  },
};

export default function MobilePriceChart() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [tf, setTf] = useState<TF>('1h');
  const [indicators, setIndicators] = useState<Record<IndicatorId, boolean>>({
    sma5: true,
    sma20: true,
    rsi: true,
  });
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = isDark ? THEME.dark : THEME.light;

  const toggleIndicator = (id: IndicatorId) => {
    setIndicators((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    if (!ref.current) return;

    const candleData = getDataForTf(tf);

    const chart = createChart(ref.current, {
      layout: {
        background: { type: ColorType.Solid, color: colors.bg },
        textColor: colors.text,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: colors.grid },
      },
      crosshair: { mode: CrosshairMode.Normal },
      height: 280,
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: { top: 0.1, bottom: 0.2 },
      },
      timeScale: { borderVisible: false },
    });

    // 보조지표: SMA 5, SMA 20 (먼저 추가하여 캔들 아래에 그려짐)
    if (indicators.sma5) {
      const sma5Data = calculateSMA(candleData, 5);
      const sma5Series = chart.addSeries(LineSeries, {
        color: colors.sma5,
        lineWidth: 2,
        title: 'SMA5',
      });
      sma5Series.setData(sma5Data as any);
    }
    if (indicators.sma20) {
      const sma20Data = calculateSMA(candleData, 20);
      const sma20Series = chart.addSeries(LineSeries, {
        color: colors.sma20,
        lineWidth: 2,
        title: 'SMA20',
      });
      sma20Series.setData(sma20Data as any);
    }

    // 캔들
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: colors.bid,
      downColor: colors.ask,
      wickUpColor: colors.bid,
      wickDownColor: colors.ask,
      borderVisible: false,
    });
    candleSeries.setData(candleData as any);

    // RSI (별도 스케일)
    if (indicators.rsi) {
      const rsiData = calculateRSI(candleData, 14);
      const rsiSeries = chart.addSeries(LineSeries, {
        color: colors.rsi,
        lineWidth: 1,
        priceScaleId: 'rsi',
        title: 'RSI',
      });
      rsiSeries.setData(rsiData as any);

      chart.priceScale('rsi').applyOptions({
        scaleMargins: { top: 0.85, bottom: 0.05 },
        borderVisible: false,
      });
    }

    chart.timeScale().fitContent();

    return () => chart.remove();
  }, [tf, theme, indicators.sma5, indicators.sma20, indicators.rsi, colors.bg, colors.text, colors.grid, colors.bid, colors.ask, colors.sma5, colors.sma20, colors.rsi]);

  return (
    <section className="px-4 mt-4">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="caption" style={{ color: 'var(--upbit-text-dim)' }}>보조지표</span>
        {INDICATORS.map(({ id, label }) => {
          const isOn = indicators[id];
          const btnColor = id === 'sma5' ? colors.sma5 : id === 'sma20' ? colors.sma20 : colors.rsi;
          return (
            <button
              key={id}
              type="button"
              onClick={() => toggleIndicator(id)}
              className="px-2.5 py-1 rounded-md caption font-medium transition border"
              style={{
                backgroundColor: isOn ? btnColor : 'var(--upbit-panel)',
                borderColor: isOn ? btnColor : 'var(--upbit-border)',
                color: isOn ? '#fff' : 'var(--upbit-text-dim)',
                opacity: isOn ? 1 : 0.6,
              }}
              title={isOn ? '클릭하여 숨기기' : '클릭하여 표시'}
            >
              {label}
            </button>
          );
        })}
      </div>
      <div ref={ref} className="w-full h-[280px] rounded-[var(--upbit-radius)] overflow-hidden" />
      <div className="flex gap-2 mt-2 overflow-x-auto no-scrollbar pb-1">
        {(['1s', '5s', '1m', '1h', '1D', '1W', '1M'] as TF[]).map((k) => (
          <button
            key={k}
            onClick={() => setTf(k)}
            className={`px-3 py-1.5 rounded-lg body-sm font-medium transition ${
              tf === k
                ? 'bg-[var(--upbit-bid)] text-white'
                : 'bg-[var(--upbit-panel)] text-[var(--upbit-text-dim)] border border-[var(--upbit-border)]'
            }`}
          >
            {k}
          </button>
        ))}
      </div>
    </section>
  );
}

'use client';

/**
 * MarketCandleChart
 *
 * 거래소형 캔들차트 (lightweight-charts v5 기반)
 * - 캔들스틱 (양봉 파란색 / 음봉 빨간색 — 한국 거래소 표준)
 * - 이동평균 MA5 / MA20 토글
 * - 하단 거래량 히스토그램
 * - 타임프레임 탭: 1분 / 5분 / 1시간 / 1일 / 1주
 * - 현재가 배지
 * - ResizeObserver 반응형
 */

import { useEffect, useRef, useState } from 'react';
import {
  createChart,
  ColorType,
  CrosshairMode,
  CandlestickSeries,
  LineSeries,
  HistogramSeries,
  type IChartApi,
} from 'lightweight-charts';
import { generateOhlcSeries, computeMA, type OhlcTf } from '@/lib/charts/ohlcAdapter';
import { formatKRW } from '@/lib/mock/marketItems';

// ── 타임프레임 설정 ──────────────────────────────────────────────────────────
type TF = OhlcTf;
const TF_LIST: TF[] = ['1m', '5m', '1h', '1d', '1w'];
const TF_LABEL: Record<TF, string> = {
  '1m': '1분',
  '5m': '5분',
  '1h': '1시간',
  '1d': '1일',
  '1w': '1주',
};

// ── 색상 토큰 — Royal Blue 금융형 ───────────────────────────────────────────
const C = {
  bg:          '#FFFFFF',
  grid:        'rgba(0,0,0,0.055)',
  text:        'rgba(0,0,0,0.50)',
  crosshairBg: '#2563EB',
  bid:         '#1565C0',   // 양봉 — 파란색 (한국 거래소 표준)
  ask:         '#C62828',   // 음봉 — 빨간색
  volBid:      'rgba(21,101,192,0.40)',
  volAsk:      'rgba(198,40,40,0.40)',
  ma5:         '#F59E0B',   // amber
  ma20:        '#3B82F6',   // blue
} as const;

// ── Props ────────────────────────────────────────────────────────────────────
type Props = {
  seed: string;
  basePrice: number;
  chgPct?: number;
  height?: number;
};

// ── 보조 컴포넌트 ────────────────────────────────────────────────────────────
function TFTab({
  value,
  onChange,
}: {
  value: TF;
  onChange: (v: TF) => void;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {TF_LIST.map((tf) => (
        <button
          key={tf}
          type="button"
          onClick={() => onChange(tf)}
          className={`px-2.5 py-1.5 rounded-lg text-[12px] font-extrabold transition ${
            value === tf
              ? 'bg-[#2563EB] text-white'
              : 'text-black/50 hover:text-black hover:bg-black/5'
          }`}
        >
          {TF_LABEL[tf]}
        </button>
      ))}
    </div>
  );
}

function MAToggle({
  label,
  color,
  active,
  onClick,
}: {
  label: string;
  color: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-bold transition border"
      style={{
        backgroundColor: active ? `${color}18` : 'transparent',
        borderColor: active ? color : 'rgba(0,0,0,0.10)',
        color: active ? color : 'rgba(0,0,0,0.40)',
      }}
    >
      <span
        className="inline-block w-3 h-[2px] rounded-full"
        style={{ backgroundColor: active ? color : 'rgba(0,0,0,0.20)' }}
      />
      {label}
    </button>
  );
}

// ── 메인 컴포넌트 ────────────────────────────────────────────────────────────
export default function MarketCandleChart({ seed, basePrice, chgPct = 0, height = 380 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef     = useRef<IChartApi | null>(null);

  const [tf, setTf]         = useState<TF>('1h');
  const [showMA5, setMA5]   = useState(true);
  const [showMA20, setMA20] = useState(false);

  const up = chgPct >= 0;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const candles = generateOhlcSeries(seed, basePrice, tf, up);

    const chart = createChart(container, {
      width:  container.clientWidth,
      height,
      layout: {
        background: { type: ColorType.Solid, color: C.bg },
        textColor:  C.text,
        fontFamily: '"Inter", "Noto Sans KR", ui-monospace, monospace',
        fontSize:   11,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: C.grid },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          labelBackgroundColor: C.crosshairBg,
          color: 'rgba(37,99,235,0.35)',
        },
        horzLine: {
          labelBackgroundColor: C.crosshairBg,
          color: 'rgba(37,99,235,0.25)',
        },
      },
      rightPriceScale: {
        borderVisible:  false,
        scaleMargins:   { top: 0.08, bottom: 0.28 },
      },
      timeScale: {
        borderVisible:     false,
        timeVisible:       true,
        secondsVisible:    tf === '1m' || tf === '5m',
      },
      handleScroll: true,
      handleScale:  true,
    });

    chartRef.current = chart;

    // ── MA 보조선 (캔들 뒤에 먼저 추가) ────────────────────────────────────
    if (showMA5) {
      const ma5Data = computeMA(candles, 5);
      const s = chart.addSeries(LineSeries, {
        color:             C.ma5,
        lineWidth:         1,
        title:             'MA5',
        priceLineVisible:  false,
        lastValueVisible:  false,
        crosshairMarkerVisible: false,
      });
      s.setData(ma5Data as Parameters<typeof s.setData>[0]);
    }
    if (showMA20) {
      const ma20Data = computeMA(candles, 20);
      const s = chart.addSeries(LineSeries, {
        color:             C.ma20,
        lineWidth:         1,
        title:             'MA20',
        priceLineVisible:  false,
        lastValueVisible:  false,
        crosshairMarkerVisible: false,
      });
      s.setData(ma20Data as Parameters<typeof s.setData>[0]);
    }

    // ── 캔들스틱 ────────────────────────────────────────────────────────────
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor:      C.bid,
      downColor:    C.ask,
      borderVisible: false,
      wickUpColor:   C.bid,
      wickDownColor: C.ask,
    });
    candleSeries.setData(
      candles.map((c) => ({
        time:  c.time as Parameters<typeof candleSeries.setData>[0][0]['time'],
        open:  c.open,
        high:  c.high,
        low:   c.low,
        close: c.close,
      })),
    );

    // ── 거래량 히스토그램 ───────────────────────────────────────────────────
    const volSeries = chart.addSeries(HistogramSeries, {
      color:       C.volBid,
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    });
    volSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.80, bottom: 0 },
      borderVisible: false,
    });
    volSeries.setData(
      candles.map((c) => ({
        time:  c.time as Parameters<typeof volSeries.setData>[0][0]['time'],
        value: c.volume,
        color: c.close >= c.open ? C.volBid : C.volAsk,
      })),
    );

    chart.timeScale().fitContent();

    // ── ResizeObserver ──────────────────────────────────────────────────────
    const ro = new ResizeObserver(() => {
      if (container) chart.applyOptions({ width: container.clientWidth });
    });
    ro.observe(container);

    return () => {
      ro.disconnect();
      chartRef.current = null;
      chart.remove();
    };
  }, [seed, basePrice, tf, showMA5, showMA20, height, up]);

  return (
    <div className="select-none">
      {/* ── 헤더 컨트롤 ── */}
      <div className="flex items-center justify-between gap-3 px-4 pt-3 pb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <TFTab value={tf} onChange={setTf} />
          <span className="text-black/20 text-[10px]">|</span>
          <MAToggle label="MA5"  color={C.ma5}  active={showMA5}  onClick={() => setMA5((v) => !v)} />
          <MAToggle label="MA20" color={C.ma20} active={showMA20} onClick={() => setMA20((v) => !v)} />
        </div>
        <div className="flex items-baseline gap-1.5 shrink-0">
          <span
            className={`text-[15px] font-extrabold tabular-nums ${up ? 'text-[#1565C0]' : 'text-[#C62828]'}`}
          >
            {formatKRW(basePrice)}
          </span>
          <span
            className={`text-[12px] font-bold tabular-nums ${up ? 'text-[#1565C0]' : 'text-[#C62828]'}`}
          >
            {up ? '▲' : '▼'} {Math.abs(chgPct).toFixed(2)}%
          </span>
        </div>
      </div>

      {/* ── 차트 컨테이너 ── */}
      <div
        ref={containerRef}
        style={{ height, background: C.bg }}
        className="overflow-hidden"
      />

      {/* ── 범례 ── */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-black/[0.04]">
        <div className="flex items-center gap-3 text-[10px] text-black/40">
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-sm bg-[#1565C0]" /> 양봉 (상승)
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-sm bg-[#C62828]" /> 음봉 (하락)
          </span>
        </div>
        <div className="text-[10px] text-black/35">
          {TF_LABEL[tf]} 봉 · 거래량 포함
        </div>
      </div>
    </div>
  );
}

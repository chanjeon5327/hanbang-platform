/**
 * TEMPORARY ADAPTER — 임시 OHLC 어댑터
 *
 * close-only 시리즈(가격)에서 결정론적(seed 기반) OHLC + 거래량 데이터를 생성한다.
 * 실제 가격 API가 붙으면 이 파일을 실제 OHLC fetch로 교체하고,
 * MarketCandleChart의 `generateOhlcSeries` 호출만 swap 하면 된다.
 */

import { hashSeed, mulberry32 } from '@/lib/mock/series';

export type OhlcCandle = {
  time: number;    // Unix timestamp (seconds)
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;  // 상대 거래량 단위
};

export type OhlcTf = '1m' | '5m' | '1h' | '1d' | '1w';

const TF_SEC: Record<OhlcTf, number> = {
  '1m':  60,
  '5m':  300,
  '1h':  3600,
  '1d':  86400,
  '1w':  604800,
};

const TF_CANDLES: Record<OhlcTf, number> = {
  '1m':  120,
  '5m':  120,
  '1h':  120,
  '1d':  60,
  '1w':  52,
};

/** 봉 크기 대비 변동성 (close 기준 비율) */
const TF_VOL_RATIO: Record<OhlcTf, number> = {
  '1m':  0.006,
  '5m':  0.010,
  '1h':  0.015,
  '1d':  0.022,
  '1w':  0.032,
};

/** 전체 시리즈 드리프트 크기 */
const TF_DRIFT: Record<OhlcTf, number> = {
  '1m':  0.010,
  '5m':  0.016,
  '1h':  0.022,
  '1d':  0.038,
  '1w':  0.055,
};

/**
 * 결정론적 OHLC 시리즈를 생성한다.
 *
 * @param seed - 종목 ID 등 고유 문자열
 * @param basePrice - 현재가(마지막 봉의 close 값이 이 값으로 정규화됨)
 * @param tf - 타임프레임
 * @param upTrend - true=상승 추세 / false=하락 추세 / undefined=seed로 결정
 */
export function generateOhlcSeries(
  seed: string,
  basePrice: number,
  tf: OhlcTf,
  upTrend?: boolean,
): OhlcCandle[] {
  const rnd = mulberry32(hashSeed(`ohlc:${seed}:${tf}`));
  const count   = TF_CANDLES[tf];
  const intSec  = TF_SEC[tf];
  const volR    = TF_VOL_RATIO[tf];
  const drift   = TF_DRIFT[tf];

  // 추세 방향
  const isUp = upTrend !== undefined ? upTrend : rnd() > 0.42;
  const driftDir = isUp ? 1 : -1;

  // 타임스탬프 (현재에서 count봉 이전 ~ 현재)
  const now    = Math.floor(Date.now() / 1000);
  const nowAligned = Math.floor(now / intSec) * intSec;
  const startTs    = nowAligned - (count - 1) * intSec;

  // ── 1단계: close 시리즈 생성 ──
  const closes: number[] = [];
  let price = basePrice * (0.88 + rnd() * 0.16);

  for (let i = 0; i < count; i++) {
    const noise   = (rnd() - 0.5) * volR * price * 2.2;
    const dStep   = driftDir * drift * price / count;
    const inertia = closes.length >= 2
      ? (closes[closes.length - 1] - closes[closes.length - 2]) * 0.16
      : 0;

    // 스파이크 (~17봉마다 60% 확률)
    let spike = 0;
    if (i > 0 && i % 17 === 0 && rnd() > 0.55) {
      spike = (rnd() - 0.5) * volR * price * 4.5;
    }

    price = Math.max(basePrice * 0.45, price + noise + dStep + inertia + spike);
    closes.push(price);
  }

  // ── 2단계: 마지막 close = basePrice로 스케일 ──
  const scaleFactor = basePrice / closes[closes.length - 1];

  // ── 3단계: 각 봉의 OHLC + volume 생성 ──
  const candles: OhlcCandle[] = [];
  for (let i = 0; i < count; i++) {
    const ts    = startTs + i * intSec;
    const close = Math.max(1, Math.round(closes[i] * scaleFactor));
    const prevC = i > 0 ? Math.round(closes[i - 1] * scaleFactor) : close;

    // Open: 이전 close에서 작은 갭
    const openDelta = (rnd() - 0.5) * Math.abs(close - prevC) * 0.45;
    const open = Math.max(1, Math.round(prevC + openDelta));

    // Wick 길이
    const body  = Math.abs(close - open);
    const wick  = Math.max(body * 0.3, close * volR * 0.35);
    const high  = Math.round(Math.max(open, close) + rnd() * wick);
    const low   = Math.max(1, Math.round(Math.min(open, close) - rnd() * wick));

    // 거래량: 봉 크기에 비례
    const baseVol = 60 + rnd() * 180;
    const volume  = Math.max(1, Math.round(baseVol * (1 + (body / Math.max(1, close)) * 18)));

    candles.push({ time: ts, open, high, low, close, volume });
  }

  return candles;
}

/** close 배열에서 단순이동평균(SMA)을 계산한다. */
export function computeMA(
  candles: OhlcCandle[],
  period: number,
): { time: number; value: number }[] {
  const result: { time: number; value: number }[] = [];
  for (let i = period - 1; i < candles.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) sum += candles[i - j].close;
    result.push({ time: candles[i].time, value: Math.round(sum / period) });
  }
  return result;
}

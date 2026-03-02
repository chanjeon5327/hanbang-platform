export function hashSeed(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) || 1;
}

export function mulberry32(seed: number) {
  let t = seed >>> 0;
  return function rand() {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** 리얼리티 있는 더미 시계열: 완만한 추세 + 노이즈 + 가끔 스파이크 */
export function makeRealisticSeries(opts: {
  seed: string;
  points: number;
  start: number;
  drift?: number;     // 추세(양수/음수)
  vol?: number;       // 변동성
  spikeEvery?: number;// n포인트마다 스파이크 확률
}) {
  const { seed, points, start, drift = 0.02, vol = 0.8, spikeEvery = 17 } = opts;
  const rnd = mulberry32(hashSeed(seed));
  const out: number[] = [];
  let v = start;

  for (let i = 0; i < points; i++) {
    // 기본 움직임: drift + 노이즈
    const noise = (rnd() - 0.5) * vol;

    // 가끔 스파이크
    let spike = 0;
    if (i % spikeEvery === 0 && i !== 0) {
      const p = rnd();
      if (p > 0.65) spike = (rnd() - 0.5) * vol * 6;
    }

    // 관성(이전 변화 일부 유지)
    const inertia = i === 0 ? 0 : (out[i - 1] - (out[i - 2] ?? out[i - 1])) * 0.25;

    v = v + drift + noise + spike + inertia;

    // 바닥/천장 간단 클램프
    if (v < 10) v = 10 + rnd() * 2;
    out.push(Number(v.toFixed(2)));
  }

  return out;
}

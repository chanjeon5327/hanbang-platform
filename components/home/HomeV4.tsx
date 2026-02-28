'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './home-legacy.module.css';
import BottomNavigation from '@/components/home/BottomNavigation';
import { useDashboardSummary } from '@/components/home/useDashboardSummary';
import { createClient } from '@/utils/supabase/client';

type PopularItem = {
  id: string;
  title?: string;
  subtitle?: string;
  thumbnail_url?: string;
  price_krw?: number;
  yield_rate?: number;
};

function formatKrw(n: number) {
  try {
    return new Intl.NumberFormat('ko-KR').format(n);
  } catch {
    return String(n);
  }
}

function safeThumb(url?: string) {
  return url || '/placeholders/product-placeholder.png';
}

const FALLBACK_RAIL_ITEMS: PopularItem[] = Array.from({ length: 6 }, (_, i) => ({
  id: `fallback-${i}`,
  title: '추천 종목',
  subtitle: '상장 종목',
  thumbnail_url: '/placeholders/product-placeholder.png',
  price_krw: 12300,
  yield_rate: 4.2,
}));

function seededRand(seed: number) {
  let s = seed >>> 0;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
}

function hashStr(str: string) {
  let h = 2166136261;
  for (const c of str) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function buildIndexSeries(
  items: PopularItem[],
  pointsCount = 42
): { values: number[]; changePct: number } {
  const prices = items
    .map((it) => Number(it?.price_krw))
    .filter((v) => Number.isFinite(v) && v > 0);
  const baseAvg = prices.length
    ? prices.reduce((a, b) => a + b, 0) / prices.length
    : 12300;

  const seriesList = items
    .filter(
      (it) =>
        Number.isFinite(Number(it?.price_krw)) && Number(it?.price_krw) > 0
    )
    .slice(0, 10)
    .map((it) => {
      const base = Number(it.price_krw);
      const rand = seededRand(hashStr(String(it.id ?? it.title ?? base)));
      const driftSign = rand() > 0.5 ? 1 : -1;
      const amp = 0.006 + rand() * 0.004;
      const waveAmp = 0.004 + rand() * 0.003;
      const driftAmp = 0.004 * driftSign;
      const vals: number[] = [];
      for (let i = 0; i < pointsCount; i++) {
        const t = i / (pointsCount - 1);
        const wave = Math.sin(t * Math.PI * 2 * (1.2 + rand())) * waveAmp;
        const noise = (rand() - 0.5) * amp;
        const drift = (t - 0.5) * driftAmp;
        const v = base * (1 + wave + noise + drift);
        vals.push(v);
      }
      return vals;
    });

  if (seriesList.length === 0) {
    const rand = seededRand(777);
    const vals: number[] = [];
    for (let i = 0; i < pointsCount; i++) {
      const t = i / (pointsCount - 1);
      const wave = Math.sin(t * Math.PI * 2 * 1.1) * 0.004;
      const noise = (rand() - 0.5) * 0.004;
      const drift = (t - 0.5) * 0.003;
      vals.push(baseAvg * (1 + wave + noise + drift));
    }
    seriesList.push(vals);
  }

  const values = Array.from({ length: pointsCount }, (_, i) => {
    const s =
      seriesList.reduce((a, arr) => a + arr[i], 0) / seriesList.length;
    return s;
  });

  const first = values[0] ?? baseAvg;
  const last = values[values.length - 1] ?? first;
  const changePct = first ? ((last - first) / first) * 100 : 0;

  return { values, changePct };
}

function Sparkline({ values }: { values: number[] }) {
  const W = 320,
    H = 86,
    P = 10;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(1e-6, max - min);
  const pts = values.map((v, i) => {
    const x = P + (i * (W - 2 * P)) / (values.length - 1 || 1);
    const y = P + (1 - (v - min) / span) * (H - 2 * P);
    return [x, y] as const;
  });
  const d = pts
    .map((p, i) =>
      i === 0
        ? `M ${p[0].toFixed(2)} ${p[1].toFixed(2)}`
        : `L ${p[0].toFixed(2)} ${p[1].toFixed(2)}`
    )
    .join(' ');
  return (
    <svg
      className={styles.trendSvg}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
    >
      <path className={styles.trendPath} d={d} />
    </svg>
  );
}

export default function HomeV4() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const dash = useDashboardSummary();

  const [loading, setLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  const [popular, setPopular] = useState<PopularItem[]>([]);
  const [popularLoading, setPopularLoading] = useState(true);

  const baseItems =
    popular.length > 0 ? popular : FALLBACK_RAIL_ITEMS;
  const baseAvg = useMemo(() => {
    const prices = baseItems
      .map((it) => Number(it?.price_krw))
      .filter((v) => Number.isFinite(v) && v > 0);
    return prices.length > 0
      ? prices.reduce((a, b) => a + b, 0) / prices.length
      : 12300;
  }, [baseItems]);
  const initialTrend = useMemo(
    () => buildIndexSeries(baseItems, 42),
    [baseItems]
  );

  const [trendValues, setTrendValues] = useState<number[]>(
    initialTrend.values
  );
  const [trendChangePct, setTrendChangePct] = useState<number>(
    initialTrend.changePct
  );

  const trendRef = useRef<{ values: number[]; last: number } | null>(null);
  const baseAvgRef = useRef<number>(baseAvg);

  useEffect(() => {
    baseAvgRef.current = baseAvg;
  }, [baseAvg]);

  useEffect(() => {
    setTrendValues(initialTrend.values);
    setTrendChangePct(initialTrend.changePct);
    trendRef.current = {
      values: [...initialTrend.values],
      last: initialTrend.values[initialTrend.values.length - 1] ?? 12300,
    };
  }, [initialTrend.values, initialTrend.changePct]);

  // K-CIX 실시간 업데이트: 1200ms마다 마지막 포인트만 EMA로 갱신
  useEffect(() => {
    let mounted = true;
    function seededRandLocal(seed: number) {
      let s = seed >>> 0;
      return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
    }
    const rand = seededRandLocal(Date.now() & 0xffffffff);
    const id = setInterval(() => {
      const st = trendRef.current;
      if (!mounted || !st || st.values.length === 0) return;

      const base = baseAvgRef.current ?? 12300;
      const noiseBase = 0.0016; // ±0.08%
      const noise = (rand() - 0.5) * noiseBase;
      const target = base * (1 + noise);

      const alpha = 0.18;
      const nextLast = st.last + (target - st.last) * alpha;
      st.last = nextLast;

      const next = st.values.slice();
      next[next.length - 1] = nextLast;
      st.values = next;

      const first = next[0] ?? base;
      const last = nextLast ?? first;
      const pct = first ? ((last - first) / first) * 100 : 0;

      setTrendValues(next);
      setTrendChangePct(pct);
    }, 1200);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  // 1) 세션 확인 — 실패해도 UI 유지 (에러 카드 금지)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        setHasSession(!!data.session);
      } catch {
        if (mounted) setHasSession(false);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [supabase]);

  // 2) (있으면) 레일 데이터 가져오기 — 실패해도 UI는 유지 (자산은 useDashboardSummary)
  useEffect(() => {
    if (!hasSession) return;

    let cancelled = false;

    (async () => {
      try {
        setPopularLoading(true);
        const r = await fetch('/api/home/popular', { cache: 'no-store' });
        if (r.ok) {
          const j = await r.json();
          const items: PopularItem[] = j?.items ?? j?.data ?? j ?? [];
          if (!cancelled) setPopular(Array.isArray(items) && items.length > 0 ? items.slice(0, 10) : FALLBACK_RAIL_ITEMS);
        } else {
          if (!cancelled) setPopular(FALLBACK_RAIL_ITEMS);
        }
      } catch {
        if (!cancelled) setPopular(FALLBACK_RAIL_ITEMS);
      } finally {
        if (!cancelled) setPopularLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hasSession]);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.guestCard}>
            <div className={styles.guestTitle}>로딩 중…</div>
            <div className={styles.guestDesc}>세션을 확인하고 있습니다.</div>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  // 비로그인: 최소 유도(마케팅 홈은 나중에 별도)
  if (!hasSession) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.guestCard}>
            <div className={styles.guestTitle}>HANBANG</div>
            <div className={styles.guestDesc}>
              로그인 후 내 자산 대시보드와 종목 거래 화면을 이용할 수 있습니다.
            </div>
            <div className={styles.guestActions}>
              <button className={styles.primaryBtn} onClick={() => router.push('/login')}>
                로그인
              </button>
              <button className={styles.secondaryBtn} onClick={() => router.push('/market')}>
                둘러보기
              </button>
            </div>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* 1) 내 자산 카드 */}
        <section className={styles.assetCard}>
          <div className={styles.assetHeaderRow}>
            <div className={styles.assetLabel}>내 자산 (KRW)</div>
            <div className={styles.assetMiniPill}>LIVE{dash.loading ? ' …' : ''}</div>
          </div>

          <div className={styles.assetValueRow}>
            <div className={styles.assetValue}>{formatKrw(dash.totalKrw || 0)}원</div>
          </div>

          <div className={styles.assetButtons}>
            <button className={styles.fillBtn} onClick={() => router.push('/wallet')}>
              채우기
            </button>
            <button className={styles.sendBtn} onClick={() => router.push('/wallet')}>
              보내기
            </button>
          </div>
        </section>

        {/* 2) 자산 요약 2x2 */}
        <section className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>모든 자산</div>
            <div className={styles.summaryValue}>{formatKrw(dash.totalKrw || 0)}원</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>현금</div>
            <div className={styles.summaryValue}>{formatKrw(dash.cashKrw || 0)}원</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>보유 자산</div>
            <div className={styles.summaryValue}>{dash.holdingCount > 0 ? `${dash.holdingCount}개` : '0개'}</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>수익률</div>
            <div className={styles.summaryValueAccent}>
              {dash.depositsKrw === 0 ? '0.00%' : `${dash.yieldPct >= 0 ? '+' : ''}${dash.yieldPct.toFixed(2)}%`}
            </div>
          </div>
        </section>

        {/* 3) 투자 등급 */}
        <section className={styles.levelCard}>
          <div className={styles.levelTopRow}>
            <div className={styles.levelTitle}>나의 투자 등급</div>
            <div className={styles.levelBadge}>호랑이 등급</div>
          </div>
          <div className={styles.levelDesc}>수수료 50% 우대 · 우선 청약 혜택</div>
        </section>

        {/* 4) 추천 레일 */}
        <section className={styles.railSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>회원님을 위한 추천</div>
            <button className={styles.sectionLink} onClick={() => router.push('/market?tab=popular')}>
              전체보기
            </button>
          </div>

          <div className={styles.rail}>
            {(popularLoading ? Array.from({ length: 6 }) : (popular.length > 0 ? popular : FALLBACK_RAIL_ITEMS).slice(0, 10)).map((it: any, idx: number) => {
              const id = it?.id ?? `fallback-${idx}`;
              const title = it?.title ?? '추천 종목';
              const subtitle = it?.subtitle ?? '상장 종목';
              const thumb = safeThumb(it?.thumbnail_url);
              const price = typeof it?.price_krw === 'number' ? it.price_krw : 12300;
              const yr = typeof it?.yield_rate === 'number' ? it.yield_rate : 4.2;
              const hasDeadline = !!(it?.deadline ?? it?.due_date);
              const chipLabel = hasDeadline
                ? '마감임박'
                : yr >= 10
                  ? '급등'
                  : yr >= 5 && yr < 10
                    ? '핫'
                    : '안정형';

              return (
                <button
                  key={id}
                  className={styles.railCard}
                  onClick={() => router.push(it?.id && !String(it.id).startsWith('fallback-') ? `/market/${it.id}` : '/market')}
                >
                  <div className={styles.railThumbWrap}>
                    <span className={styles.railChip}>{chipLabel}</span>
                    <img className={styles.railThumb} src={thumb} alt={title} />
                  </div>
                  <div className={styles.railMeta}>
                    <div className={styles.railTitle}>{title}</div>
                    <div className={styles.railSub}>{subtitle}</div>
                    <div className={styles.railBottom}>
                      <div className={styles.railPrice}>₩{formatKrw(price)}</div>
                      <div className={styles.railYield}>+{yr.toFixed(1)}%</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* 5) 시장 동향(K-CIX 지수) */}
        <section className={styles.trendCard}>
          <div className={styles.sectionHeader}>
            <div>
              <div className={styles.sectionTitle}>시장 동향</div>
              <div className={styles.trendSub}>K-콘텐츠 종합 지수 (K-CIX)</div>
            </div>
            <div className={styles.trendTopRight}>
              {(() => {
                const abs = Math.abs(trendChangePct);
                const isNeutral = abs < 0.05;
                const isUp = trendChangePct >= 0.05;
                const isDown = trendChangePct <= -0.05;
                const pillText = isNeutral
                  ? '0.0%'
                  : isUp
                    ? `▲ ${trendChangePct.toFixed(1)}%`
                    : `▼ ${abs.toFixed(1)}%`;
                const pillClass = isNeutral
                  ? styles.trendPillNeutral
                  : isUp
                    ? styles.trendPillUp
                    : styles.trendPillDown;
                return (
                  <span className={pillClass}>{pillText}</span>
                );
              })()}
              <button className={styles.sectionLink} onClick={() => router.push('/market')}>
                더보기
              </button>
            </div>
          </div>
          <div className={styles.trendChartWrap}>
            <Sparkline values={trendValues} />
          </div>
        </section>

        {/* 6) KYC 유도 */}
        <section className={styles.kycCard}>
          <div className={styles.kycTitle}>KYC 인증을 완료하고 거래를 시작하세요</div>
          <div className={styles.kycDesc}>인증 완료 시 출금/거래 한도가 상향됩니다.</div>
          <button className={styles.kycBtn} onClick={() => router.push('/kyc')}>
            KYC 인증하기
          </button>
        </section>

        {/* 7) 공지사항 */}
        <section className={styles.noticeCard}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>공지사항</div>
            <button className={styles.sectionLink} onClick={() => router.push('/notifications')}>
              전체
            </button>
          </div>
          <ul className={styles.noticeList}>
            <li className={styles.noticeItem}>[안내] 서비스 베타 운영 정책</li>
            <li className={styles.noticeItem}>[점검] 결제/정산 시스템 점검 일정</li>
            <li className={styles.noticeItem}>[공지] 신규 종목 상장 안내</li>
          </ul>
        </section>

        {/* 8) 1:1 문의 플로팅 */}
        <button className={styles.fab} onClick={() => router.push('/support')}>
          1:1 문의
        </button>
      </div>

      <BottomNavigation />
    </div>
  );
}

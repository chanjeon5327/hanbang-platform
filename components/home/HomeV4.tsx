'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Sparkles, TrendingUp, Flame } from 'lucide-react';
import styles from './home-legacy.module.css';
import { useDashboardSummary } from './useDashboardSummary';

/**
 * 홈 요구사항
 * 1) 최상단에 "오늘의 큐레이션 1개" (가장 잘나가는 상품 1개) 큰 카드
 * 2) K-CIX: 빨강/파랑 띠(밴드) + 라인, 빠르게 움직임
 * 3) KYC 카드: 젊은 톤(밝은/귀여운), 등급에 아이콘 슬롯(임시)
 */

type RailItem = {
  id?: string;
  productId?: string;
  content_id?: string;
  title?: string;
  name?: string;
  category?: string;
  category_name?: string;
  price_krw?: number;
  change_pct?: number;
  thumbnail_url?: string;
  image_url?: string;
  yt_video_id?: string;
};

function safeNum(v: unknown, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function formatKrw(n: number) {
  try {
    return new Intl.NumberFormat('ko-KR').format(Math.round(n)) + '원';
  } catch {
    return `${Math.round(n)}원`;
  }
}

function pickId(x: RailItem) {
  return (x.productId || x.id || x.content_id || '') as string;
}

function pickTitle(x: RailItem) {
  return (x.title || x.name || '추천 종목') as string;
}

function pickThumb(x: RailItem) {
  return (x.thumbnail_url || x.image_url || '') as string;
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

async function fetchJson<T>(url: string): Promise<T> {
  const r = await fetch(url, { cache: 'no-store' });
  const j = await r.json();
  return j as T;
}

/** 홈 추천 레일(기존 API shape 방어) */
async function fetchPopular6(): Promise<RailItem[]> {
  try {
    const j = await fetchJson<Record<string, unknown>>('/api/home/popular');
    const arr =
      (Array.isArray(j?.items) && j.items) ||
      (Array.isArray(j?.data) && j.data) ||
      (Array.isArray(j?.rows) && j.rows) ||
      (Array.isArray(j?.popular) && j.popular) ||
      [];
    return arr.slice(0, 6) as RailItem[];
  } catch {
    return [];
  }
}

/** 임시 fallback */
const FALLBACK_RAIL_ITEMS: RailItem[] = [
  { id: 'fallback-1', title: '영화 블록버스터', category: 'movie', price_krw: 12300, change_pct: 4.2, thumbnail_url: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=60' },
  { id: 'fallback-2', title: '유튜브 크리에이터 일상', category: 'youtube', price_krw: 12300, change_pct: 4.2, thumbnail_url: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=1200&q=60' },
  { id: 'fallback-3', title: '웹소설 달빛 아래 그대', category: 'webnovel', price_krw: 12300, change_pct: 4.2, thumbnail_url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=60' },
  { id: 'fallback-4', title: '게임 스트리머 라이브', category: 'game', price_krw: 12300, change_pct: 4.2, thumbnail_url: 'https://images.unsplash.com/photo-1504270997636-07ddfbd48945?auto=format&fit=crop&w=1200&q=60' },
  { id: 'fallback-5', title: '인기 웹툰 모험기', category: 'webtoon', price_krw: 12300, change_pct: 4.2, thumbnail_url: 'https://images.unsplash.com/photo-1526481280695-3c687fd643ed?auto=format&fit=crop&w=1200&q=60' },
  { id: 'fallback-6', title: '드라마 스페셜', category: 'drama', price_krw: 12300, change_pct: 4.2, thumbnail_url: 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=1200&q=60' },
];

function Sparkline({ values }: { values: number[] }) {
  const w = 320;
  const h = 86;
  const pad = 6;

  const n = values?.length ?? 0;
  if (n < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const bandHeight = 22;
  const usableH = h - pad * 2 - bandHeight;

  const xStep = (w - pad * 2) / (n - 1);
  const yFor = (v: number) => {
    const t = (v - min) / range;
    return pad + (1 - t) * usableH;
  };

  const pts = values.map((v, i) => [pad + i * xStep, yFor(v)] as const);
  const d = pts
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(2)},${p[1].toFixed(2)}`)
    .join(' ');

  const deltas = values.slice(1).map((v, i) => v - values[i]);
  const maxAbs = Math.max(...deltas.map((x) => Math.abs(x))) || 1;

  const bandTop = h - pad - bandHeight;
  const bandBot = h - pad;
  const bandH = bandBot - bandTop;

  const bars = deltas.map((dv, i) => {
    const intensity = Math.min(1, Math.abs(dv) / maxAbs);
    const bh = 6 + intensity * (bandH - 6);
    const y = bandBot - bh;
    return {
      x: pad + i * xStep,
      y,
      w: xStep,
      h: bh,
      up: dv >= 0,
    };
  });

  return (
    <svg className={styles.trendSvg} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="kixBlueGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563EB" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#2563EB" stopOpacity="0.06" />
        </linearGradient>
        <linearGradient id="kixRedGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#DC2626" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#DC2626" stopOpacity="0.06" />
        </linearGradient>
        <filter id="kixGlow" x="-20%" y="-30%" width="140%" height="180%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.1" floodColor="#7C3AED" floodOpacity="0.22" />
        </filter>
      </defs>

      <g>
        {bars.map((b, idx) => (
          <rect
            key={idx}
            x={b.x}
            y={b.y}
            width={Math.max(1, b.w - 1.2)}
            height={b.h}
            rx="2"
            ry="2"
            fill={b.up ? 'url(#kixBlueGrad)' : 'url(#kixRedGrad)'}
          />
        ))}
      </g>

      <path d={d} className={styles.trendPath} filter="url(#kixGlow)" />
    </svg>
  );
}

function RankBadge({ label }: { label: string }) {
  const emoji = label.includes('호랑') ? '🐯' : '⭐';
  return (
    <span className={styles.rankBadge}>
      <span className={styles.rankEmoji} aria-hidden>
        {emoji}
      </span>
      <span className={styles.rankLabel}>{label}</span>
    </span>
  );
}

export default function HomeV4() {
  const dash = useDashboardSummary();

  const [popular, setPopular] = useState<RailItem[]>([]);
  const [popularLoading, setPopularLoading] = useState(true);

  const baseItems = popular.length ? popular : FALLBACK_RAIL_ITEMS;
  const heroItem = baseItems[0];

  const rail3 = baseItems.slice(0, 3);

  const baseAvgPrice = useMemo(() => {
    const xs = baseItems.map((x) => safeNum(x.price_krw, 0)).filter((v) => v > 0);
    if (!xs.length) return 12300;
    return xs.reduce((a, b) => a + b, 0) / xs.length;
  }, [baseItems]);

  const [kcixValues, setKcixValues] = useState<number[]>(() => {
    const n = 44;
    const arr: number[] = [];
    let v = 0;
    for (let i = 0; i < n; i++) {
      v = clamp(v + (Math.random() - 0.5) * 0.22, -1.0, 1.0);
      arr.push(v);
    }
    return arr;
  });
  const [kcixChangePct, setKcixChangePct] = useState<number>(0.2);

  const kcixRef = useRef<{ last: number }>({ last: 0 });
  const baseAvgRef = useRef<number>(baseAvgPrice);

  useEffect(() => {
    baseAvgRef.current = baseAvgPrice;
  }, [baseAvgPrice]);

  useEffect(() => {
    let mounted = true;

    const interval = setInterval(() => {
      if (!mounted) return;

      setKcixValues((prev) => {
        const last = prev[prev.length - 1] ?? 0;
        const pull = -last * 0.26;
        const shock = (Math.random() - 0.5) * 0.35;
        const next = clamp(last + pull + shock, -1.2, 1.2);

        kcixRef.current.last = next;

        const nextArr = prev.slice(1);
        nextArr.push(next);

        setKcixChangePct(Number(next.toFixed(1)));

        return nextArr;
      });
    }, 180);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      setPopularLoading(true);
      const items = await fetchPopular6();
      if (!alive) return;
      setPopular(items);
      setPopularLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const heroId = pickId(heroItem);
  const heroHref = heroId ? `/market/${heroId}` : '/market';

  const heroPrice = safeNum(heroItem.price_krw, 12300);
  const heroChange = safeNum(heroItem.change_pct, 4.2);

  const isUp = kcixChangePct >= 0;

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <section className={styles.featuredSection}>
          <Link href={heroHref} className={styles.featuredCard}>
            <div className={styles.featuredTop}>
              <div className={styles.featuredTag}>
                <Flame size={14} />
                <span>오늘의 큐레이션</span>
              </div>
              <div className={styles.featuredMeta}>
                <span className={styles.featuredMetaPill}>
                  <TrendingUp size={14} />
                  <span>{heroChange > 0 ? `+${heroChange.toFixed(1)}` : heroChange.toFixed(1)}%</span>
                </span>
              </div>
            </div>

            <div className={styles.featuredMedia}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pickThumb(heroItem) || 'https://images.unsplash.com/photo-1526481280695-3c687fd643ed?auto=format&fit=crop&w=1200&q=60'}
                alt={pickTitle(heroItem)}
                className={styles.featuredImg}
                loading="lazy"
              />
            </div>

            <div className={styles.featuredInfo}>
              <div className={styles.featuredTitleRow}>
                <h2 className={styles.featuredTitle}>{pickTitle(heroItem)}</h2>
                <span className={styles.featuredCta}>
                  <Sparkles size={14} />
                  <span>지금 보기</span>
                </span>
              </div>

              <div className={styles.featuredPriceRow}>
                <span className={styles.featuredPrice}>{formatKrw(heroPrice)}</span>
                <span className={styles.featuredSub}>실시간 인기 상승 중</span>
              </div>
            </div>
          </Link>
        </section>

        <section className={styles.assetCard}>
          <div className={styles.assetHeader}>
            <div className={styles.assetTitle}>내 자산 (KRW)</div>
            <div className={styles.livePill}>
              LIVE{dash.loading ? <span className={styles.liveDots}>…</span> : null}
            </div>
          </div>

          <div className={styles.assetAmount}>{formatKrw(dash.totalKrw)}</div>

          <div className={styles.assetButtons}>
            <button className={styles.btnPrimary} type="button">
              채우기
            </button>
            <button className={styles.btnSecondary} type="button">
              보내기
            </button>
          </div>
        </section>

        <section className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>모든 자산</div>
            <div className={styles.summaryValue}>{formatKrw(dash.totalKrw)}</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>현금</div>
            <div className={styles.summaryValue}>{formatKrw(dash.cashKrw)}</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>보유 자산</div>
            <div className={styles.summaryValue}>{dash.holdingCount}개</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>수익률</div>
            <div className={styles.summaryValueAccent}>{dash.yieldPct >= 0 ? '+' : ''}{dash.yieldPct.toFixed(2)}%</div>
          </div>
        </section>

        <section className={styles.rankCard}>
          <div className={styles.rankLeft}>
            <div className={styles.rankTitle}>나의 투자 등급</div>
            <div className={styles.rankSub}>수수료 50% 우대 · 우선 청약 혜택</div>
          </div>
          <RankBadge label={(dash as { rankLabel?: string }).rankLabel || '호랑이 등급'} />
        </section>

        <section className={styles.railSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>회원님을 위한 추천</div>
            <Link href="/market" className={styles.sectionMore}>
              전체보기
            </Link>
          </div>

          <div className={styles.rail}>
            {rail3.map((it, idx) => {
              const id = pickId(it) || `fallback-${idx}`;
              const href = pickId(it) ? `/market/${id}` : '/market';
              const price = safeNum(it.price_krw, 12300);
              const change = safeNum(it.change_pct, 4.2);

              return (
                <Link key={id} href={href} className={styles.railCard}>
                  <div className={styles.railThumb}>
                    <span className={styles.railBadge}>안정형</span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={pickThumb(it) || 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=60'}
                      alt={pickTitle(it)}
                      className={styles.railImg}
                      loading="lazy"
                    />
                  </div>
                  <div className={styles.railBody}>
                    <div className={styles.railTitle}>{pickTitle(it)}</div>
                    <div className={styles.railSub}>상장 종목</div>
                    <div className={styles.railBottom}>
                      <span className={styles.railPrice}>{formatKrw(price).replace('원', '')}</span>
                      <span className={styles.railChange}>{change >= 0 ? `+${change.toFixed(1)}` : change.toFixed(1)}%</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {popularLoading ? <div className={styles.railLoading}>추천 로딩중…</div> : null}
        </section>

        <section className={styles.trendCard}>
          <div className={styles.trendTop}>
            <div>
              <div className={styles.trendTitle}>시장 동향</div>
              <div className={styles.trendSub}>K-콘텐츠 종합 지수 (K-CIX)</div>
            </div>

            <div className={styles.trendTopRight}>
              <span className={isUp ? styles.trendPillUp : styles.trendPillDown}>
                {isUp ? '▲' : '▼'} {Math.abs(kcixChangePct).toFixed(1)}%
              </span>
              <Link href="/market" className={styles.sectionMore}>
                더보기
              </Link>
            </div>
          </div>

          <div className={styles.trendChartWrap}>
            <Sparkline values={kcixValues} />
          </div>
        </section>

        <section className={styles.kycCard}>
          <div className={styles.kycLeft}>
            <div className={styles.kycTitle}>KYC 인증을 완료하고 거래를 시작하세요</div>
            <div className={styles.kycSub}>인증 완료 시 출금/거래 한도가 상향됩니다. (1분 컷)</div>
            <div className={styles.kycCuteRow}>
              <div className={styles.kycCuteKyc} aria-label="KYC">
                <span>K</span><span>Y</span><span>C</span>
              </div>

              <div className={styles.kycCuteGirl} aria-hidden="true">
                <svg viewBox="0 0 48 48" width="34" height="34">
                  <circle cx="24" cy="24" r="24" fill="#FFFFFF" />
                  <circle cx="24" cy="25" r="14" fill="#FFE9D6" />
                  <path
                    d="M10 24c1-10 10-14 14-14s13 4 14 14v7c-4-5-9-7-14-7s-10 2-14 7v-7z"
                    fill="#111827"
                    opacity="0.85"
                  />
                  <circle cx="19" cy="26" r="1.8" fill="#111827" />
                  <circle cx="29" cy="26" r="1.8" fill="#111827" />
                  <path d="M20 31c2.2 2 5.8 2 8 0" stroke="#111827" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                  <circle cx="16.5" cy="30" r="2.3" fill="#FCA5A5" opacity="0.55" />
                  <circle cx="31.5" cy="30" r="2.3" fill="#FCA5A5" opacity="0.55" />
                </svg>
              </div>

              <div className={styles.kycCuteCaption}>
                귀엽게 끝내는 인증 ✨ <b>혜택</b>이 열려요
              </div>
            </div>
          </div>

          <button className={styles.kycBtn} type="button">
            KYC 인증하기
          </button>
        </section>

        <section className={styles.noticeCard}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>공지사항</div>
            <Link href="/notifications" className={styles.sectionMore}>
              전체
            </Link>
          </div>

          <ul className={styles.noticeList}>
            <li>[안내] 서비스 베타 운영 정책</li>
            <li>[점검] 결제/정산 시스템 점검 일정</li>
            <li>[공지] 신규 종목 상장 안내</li>
          </ul>
        </section>

        <button className={styles.helpFab} type="button">
          1:1 문의
        </button>
      </div>
    </main>
  );
}

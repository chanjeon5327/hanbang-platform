'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import styles from './market-list.module.css';
import MarketCardV6, { MarketItem } from './MarketCardV6';

type TabKey = 'all' | 'popular' | 'deadline' | 'my' | 'category';
type SortKey = 'recommend' | 'latest' | 'price_desc' | 'price_asc' | 'change_desc' | 'change_asc';

const CATEGORIES = [
  { key: '전체', label: '전체' },
  { key: '여행', label: '여행' },
  { key: '게임', label: '게임' },
  { key: '음악', label: '음악' },
  { key: '웹툰', label: '웹툰' },
  { key: '웹소설', label: '웹소설' },
  { key: '드라마', label: '드라마' },
  { key: '먹방', label: '먹방' },
  { key: '일상', label: '일상' },
  { key: '팟캐스트', label: '팟캐스트' },
  { key: 'OTT', label: 'OTT' },
  { key: '유튜브', label: '유튜브' },
  { key: '응원', label: '응원' },
];

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'recommend', label: '추천' },
  { key: 'latest', label: '최신' },
  { key: 'price_desc', label: '가격 높은순' },
  { key: 'price_asc', label: '가격 낮은순' },
  { key: 'change_desc', label: '등락 높은순' },
  { key: 'change_asc', label: '등락 낮은순' },
];

const FALLBACK_ITEMS: MarketItem[] = [
  { id: 'fb-1', title: '영화 블록버스터', category: 'movie', priceKrw: 12300, changePct: 4.2, thumb: 'https://images.unsplash.com/photo-1527430253228-e93688616381?auto=format&fit=crop&w=1200&q=80', tags: ['추천'], statusText: '상장 종목' },
  { id: 'fb-2', title: '유튜브 크리에이터 일상', category: 'youtube', priceKrw: 12300, changePct: 4.2, thumb: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1200&q=80', tags: ['추천'], statusText: '상장 종목' },
  { id: 'fb-3', title: '웹소설 달빛 아래 그대', category: 'webnovel', priceKrw: 12300, changePct: 4.2, thumb: 'https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?auto=format&fit=crop&w=1200&q=80', tags: ['추천'], statusText: '상장 종목' },
  { id: 'fb-4', title: '게임 스트리머 라이브', category: 'game', priceKrw: 12300, changePct: 4.2, thumb: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80', tags: ['추천'], statusText: '상장 종목' },
  { id: 'fb-5', title: '인기 웹툰 모험기', category: 'webtoon', priceKrw: 12300, changePct: 4.2, thumb: 'https://images.unsplash.com/photo-1520975681960-3f1d3d06c94b?auto=format&fit=crop&w=1200&q=80', tags: ['추천'], statusText: '상장 종목' },
  { id: 'fb-6', title: '드라마 시즌제', category: 'drama', priceKrw: 12300, changePct: 4.2, thumb: 'https://images.unsplash.com/photo-1524253482453-3fed8d2fe12b?auto=format&fit=crop&w=1200&q=80', tags: ['추천'], statusText: '상장 종목' },
];

function safeStr(v: unknown, fallback = ''): string {
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return String(v);
  return fallback;
}

function safeNum(v: unknown, fallback = 0): number {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? ''));
  return Number.isFinite(n) ? n : fallback;
}

function safeNumOpt(v: unknown): number | undefined {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? ''));
  return Number.isFinite(n) ? n : undefined;
}

function ytThumb(id?: string) {
  if (!id) return '';
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

function normalizeItem(raw: Record<string, unknown>): MarketItem | null {
  if (!raw) return null;
  const id = safeStr(raw.id || raw.content_id || raw.product_id || raw.item_id || raw.uuid, '');
  const title = safeStr(raw.title || raw.content_title || raw.name || raw.product_title, '');
  if (!id || !title) return null;

  const category = safeStr(raw.category_name || raw.category || raw.kind || (Array.isArray(raw.tags) ? raw.tags[0] : null), '유튜브');
  const priceKrw = safeNum(raw.price_krw || raw.share_price_krw || raw.price || raw.sharePriceKrw || raw.priceKrw, 12300);
  const changePct = safeNum(raw.change_pct || raw.pct_change || raw.changePercent || raw.changePct, 0);

  const youtubeId = safeStr(raw.youtube_video_id || raw.youtubeId || raw.youtube_id, '');
  const thumb = safeStr(raw.thumbnail_url || raw.thumb || raw.image_url, '') || ytThumb(youtubeId);

  const tags = Array.isArray(raw.tags) ? raw.tags.slice(0, 4).map((x: unknown) => safeStr(x)).filter(Boolean) : [];
  const statusText = safeStr(raw.status_text || raw.statusText || raw.listing_status || raw.state, '상장 종목');

  const deadlineAt = safeStr(raw.deadline_at || raw.ends_at || raw.deadlineAt, '');
  const mdPick = raw.md_pick === true || raw.mdPick === true;
  const progressPct = safeNumOpt(raw.progress_pct ?? raw.progressPct);
  const trades24h = safeNumOpt(raw.trades_24h ?? raw.trades24h ?? raw.trades24H);
  const likeCount = safeNumOpt(raw.like_count ?? raw.likeCount ?? raw.likes);
  const audienceTag = safeStr(raw.audience_tag ?? raw.audienceTag ?? raw.age_tag, '');

  return {
    id,
    title,
    category,
    priceKrw,
    changePct,
    thumb,
    tags,
    statusText,
    deadlineAt,
    mdPick: mdPick || undefined,
    progressPct,
    trades24h,
    likeCount,
    audienceTag: audienceTag || undefined,
  };
}

function sortItems(items: MarketItem[], sort: SortKey) {
  const arr = [...items];
  if (sort === 'latest') return arr;
  if (sort === 'price_desc') return arr.sort((a, b) => (b.priceKrw ?? 0) - (a.priceKrw ?? 0));
  if (sort === 'price_asc') return arr.sort((a, b) => (a.priceKrw ?? 0) - (b.priceKrw ?? 0));
  if (sort === 'change_desc') return arr.sort((a, b) => (b.changePct ?? 0) - (a.changePct ?? 0));
  if (sort === 'change_asc') return arr.sort((a, b) => (a.changePct ?? 0) - (b.changePct ?? 0));
  return arr;
}

async function fetchJson(url: string) {
  const res = await fetch(url, { cache: 'no-store' });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = safeStr((j as Record<string, unknown>)?.error || (j as Record<string, unknown>)?.message, 'FETCH_FAILED');
    throw new Error(msg);
  }
  return j;
}

function pickList(j: unknown): unknown[] {
  if (Array.isArray(j)) return j;
  const o = j as Record<string, unknown>;
  if (Array.isArray(o?.items)) return o.items;
  if (Array.isArray(o?.rows)) return o.rows;
  if (Array.isArray(o?.data)) return o.data;
  if (Array.isArray(o?.contents)) return o.contents;
  if (Array.isArray(o?.picks)) return o.picks;
  return [];
}

function SkeletonGrid() {
  return (
    <div className={styles.grid}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className={styles.skeletonCard}>
          <div className={styles.skeletonThumb} />
          <div className={styles.skeletonLine} />
          <div className={styles.skeletonLine2} />
        </div>
      ))}
    </div>
  );
}

export default function MarketListV4() {
  const [tab, setTab] = useState<TabKey>('popular');
  const [sort, setSort] = useState<SortKey>('recommend');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('전체');

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<MarketItem[]>([]);
  const [popularFallback, setPopularFallback] = useState<MarketItem[]>([]);
  const [err, setErr] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const j = await fetchJson('/api/home/popular');
        const list = pickList(j).map((x) => normalizeItem(x as Record<string, unknown>)).filter(Boolean) as MarketItem[];
        if (!mounted) return;
        setPopularFallback(list.length ? list.slice(0, 6) : FALLBACK_ITEMS);
      } catch {
        if (!mounted) return;
        setPopularFallback(FALLBACK_ITEMS);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setErr('');

    const run = async () => {
      try {
        let url = '/api/market/all?limit=60';
        if (tab === 'popular') url = '/api/home/popular';
        if (tab === 'deadline') url = '/api/home/deadline';
        if (tab === 'my') url = '/api/home/my-interests';
        if (tab === 'category') url = '/api/market/all?limit=60';

        const j = await fetchJson(url);
        const listRaw = pickList(j);
        const list = listRaw.map((x) => normalizeItem(x as Record<string, unknown>)).filter(Boolean) as MarketItem[];

        if (!mounted) return;
        setItems(list);
      } catch (e: unknown) {
        if (!mounted) return;
        setItems([]);
        const msg = e instanceof Error ? e.message : safeStr(e, '로드 실패');
        if (tab === 'my' && (String(msg).includes('401') || String(msg).toLowerCase().includes('unauthorized'))) {
          setErr('');
        } else {
          setErr(msg);
        }
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    run();
    return () => { mounted = false; };
  }, [tab]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    let base = items;

    if (cat !== '전체') {
      base = base.filter((x) => safeStr(x.category).toLowerCase().includes(cat.toLowerCase()));
    }

    if (qq) {
      base = base.filter((x) => {
        const hay = `${x.title} ${x.category}`.toLowerCase();
        return hay.includes(qq);
      });
    }

    base = sortItems(base, sort);
    return base;
  }, [items, q, cat, sort]);

  const effective = useMemo(() => {
    if (loading) return [];
    if (filtered.length > 0) return filtered;
    return popularFallback.length ? popularFallback.slice(0, 6) : FALLBACK_ITEMS;
  }, [filtered, loading, popularFallback]);

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <div className={styles.title}>수익권 마켓</div>
          </div>

          <div className={styles.searchRow}>
            <div className={styles.searchWrap}>
              <span className={styles.searchIcon} aria-hidden="true">⌕</span>
              <input
                className={styles.searchInput}
                placeholder="작품명, 크리에이터명 검색"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>

            <select className={styles.sortSelect} value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className={styles.tabs}>
            <button className={`${styles.tab} ${tab === 'all' ? styles.tabOn : ''}`} onClick={() => setTab('all')}>전체</button>
            <button className={`${styles.tab} ${tab === 'popular' ? styles.tabOn : ''}`} onClick={() => setTab('popular')}>모두의 추천</button>
            <button className={`${styles.tab} ${tab === 'deadline' ? styles.tabOn : ''}`} onClick={() => setTab('deadline')}>마감임박</button>
            <button className={`${styles.tab} ${tab === 'my' ? styles.tabOn : ''}`} onClick={() => setTab('my')}>나의 관심</button>
            <button className={`${styles.tab} ${tab === 'category' ? styles.tabOn : ''}`} onClick={() => setTab('category')}>카테고리</button>
          </div>

          <div className={styles.catRow}>
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                className={`${styles.chip} ${cat === c.key ? styles.chipOn : ''}`}
                onClick={() => setCat(c.key)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </header>

        <main className={styles.main}>
          {err && !loading && (
            <div className={styles.errorBox}>
              <div className={styles.errorTitle}>불러오기에 실패했습니다</div>
              <div className={styles.errorMsg}>{err}</div>
              <button className={styles.retryBtn} type="button" onClick={() => location.reload()}>다시 시도</button>
            </div>
          )}

          {loading ? (
            <SkeletonGrid />
          ) : (
            <>
              {filtered.length === 0 && (
                <div className={styles.emptyHint}>
                  <div className={styles.emptyTitle}>지금 뜨는 추천 종목</div>
                  <div className={styles.emptySub}>조건이 비어있거나 결과가 없을 때는 추천을 보여드립니다.</div>
                </div>
              )}

              <div className={styles.grid}>
                {effective.map((it, idx) => (
                  <MarketCardV6
                    key={`${it.id}-${it.title}`}
                    item={it}
                    rank={idx + 1}
                    activeTab={tab}
                  />
                ))}
              </div>

              <div className={styles.bottomCta}>
                <Link className={styles.moreLink} href="/ops/smoke">
                  출고 스모크 체크
                </Link>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

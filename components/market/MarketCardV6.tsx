import Link from 'next/link';
import Image from 'next/image';
import styles from './market-list.module.css';

export type TabKey = 'all' | 'popular' | 'deadline' | 'my' | 'category';

export type MarketItem = {
  id: string;
  title: string;
  category: string;
  priceKrw: number;
  changePct: number;
  thumb: string;
  tags?: string[];
  statusText?: string;
  deadlineAt?: string;
  mdPick?: boolean;
  progressPct?: number;
  trades24h?: number;
  likeCount?: number;
  audienceTag?: string;
};

function formatKrw(n: number) {
  try {
    return new Intl.NumberFormat('ko-KR').format(Math.round(n));
  } catch {
    return String(Math.round(n));
  }
}

/** id 기반 해시 → 0~1 고정값 (같은 id면 항상 같은 값) */
function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h = h & h;
  }
  return Math.abs(h) / 2147483647;
}

/** 데이터 없을 때 id 기반 더미값 */
export function fillDummyFromId(item: MarketItem): MarketItem {
  const seed = hashSeed(item.id || item.title || 'x');
  const tags = item.tags || [];
  const hasMd = tags.some((t) => /^md$/i.test(String(t).trim()));

  return {
    ...item,
    likeCount: item.likeCount ?? Math.round(120 + seed * 9080),
    progressPct: item.progressPct ?? Math.round(20 + seed * 70),
    trades24h: item.trades24h ?? Math.round(30 + seed * 250),
    audienceTag:
      item.audienceTag ??
      (['20대↑', '30대↑', '한류', '웹툰', '유튜브', '드라마'][Math.floor(seed * 6)] ?? '한류'),
    changePct:
      item.changePct !== undefined && item.changePct !== 0
        ? item.changePct
        : (seed < 0.5 ? -(2.5 + seed * 8) : 2.5 + (seed - 0.5) * 8),
  };
}

/** 좌상단 라벨: 우선순위 규칙 */
function getLeftLabel(item: MarketItem, activeTab: TabKey): string {
  const tags = item.tags || [];
  const hasMd = item.mdPick || tags.some((t) => /^md$/i.test(String(t).trim()));
  const ch = item.changePct ?? 0;

  if (hasMd) return 'MD 픽';
  if (activeTab === 'deadline') return '마감임박';
  if (ch >= 2) return '급상승';
  if (ch <= -2) return '급락주의';
  return '상장 종목';
}

/** 황금 primary 뱃지 텍스트 */
function getPrimaryBadge(item: MarketItem, rank: number, activeTab: TabKey): string {
  const tags = item.tags || [];
  const hasMd = item.mdPick || tags.some((t) => /^md$/i.test(String(t).trim()));

  if (hasMd) return 'MD PICK';
  if (activeTab === 'popular' && rank > 0) return `TOP ${rank}`;
  if ((item.likeCount ?? 0) > 0) return `추천 ${item.likeCount! >= 1000 ? `${(item.likeCount! / 1000).toFixed(1)}k` : item.likeCount}`;
  return 'HOT';
}

/** 보조 secondary 뱃지 텍스트 */
function getSecondaryBadge(item: MarketItem): string {
  const tag = item.audienceTag || '';
  if (/^\d+대↑?$/.test(tag) || tag.includes('대')) return tag;
  if (tag === '한류' || tag === 'MD픽') return tag;
  const cat = item.category || '';
  const short = cat.length > 4 ? cat.slice(0, 4) : cat;
  return short || '한류';
}

export default function MarketCardV6({
  item: rawItem,
  rank = 0,
  activeTab = 'popular',
}: {
  item: MarketItem;
  rank?: number;
  activeTab?: TabKey;
}) {
  const item = fillDummyFromId(rawItem);
  const up = (item.changePct ?? 0) >= 0;
  const pct = Math.abs(item.changePct ?? 0).toFixed(1);

  const leftLabel = getLeftLabel(item, activeTab);
  const primaryBadge = getPrimaryBadge(item, rank, activeTab);
  const secondaryBadge = getSecondaryBadge(item);

  const hasProgress = item.progressPct != null && item.progressPct >= 0;
  const progressVal = Math.min(100, Math.max(0, item.progressPct ?? 0));

  return (
    <Link href={`/market/${item.id}`} className={styles.card}>
      <div className={styles.thumbWrap}>
        {item.thumb ? (
          <Image
            src={item.thumb}
            alt={item.title}
            fill
            sizes="(max-width: 520px) 100vw, 520px"
            className={styles.thumbImg}
            priority={false}
          />
        ) : (
          <div className={styles.thumbFallback} />
        )}

        <div className={styles.thumbOverlay} aria-hidden="true" />

        <div className={styles.badgeTopLeft} aria-hidden="true">
          <span className={styles.badgePill}>{leftLabel}</span>
        </div>

        <div className={styles.badgeTopRight} aria-hidden="true">
          <span className={styles.badgeGold}>{primaryBadge}</span>
          <span className={styles.badgeSecondary}>{secondaryBadge}</span>
        </div>

        <div className={styles.progressBarWrap} aria-hidden="true">
          {hasProgress ? (
            <>
              <span className={styles.progressLabel}>달성 {Math.round(progressVal)}%</span>
              <div className={styles.progressTrack}>
                <div className={styles.progressFill} style={{ width: `${progressVal}%` }} />
              </div>
            </>
          ) : (
            <span className={styles.progressLabel}>
              {item.trades24h != null && item.trades24h > 0
                ? `거래 ${item.trades24h}`
                : `관심 ${item.likeCount ?? 0}`}
            </span>
          )}
        </div>
      </div>

      <div className={styles.cardBody}>
        <div className={styles.cardTitle}>{item.title}</div>
        <div className={styles.cardMeta}>
          <span className={styles.cardStatus}>{item.statusText || '상장 종목'}</span>
          <span className={styles.cardCat}>{item.category}</span>
        </div>

        <div className={styles.cardBottom}>
          <div className={styles.cardPrice}>₩{formatKrw(item.priceKrw || 0)}</div>
          <div className={`${styles.cardChange} ${up ? styles.up : styles.down}`}>
            {up ? '+' : ''}{pct}%
          </div>
        </div>
      </div>
    </Link>
  );
}

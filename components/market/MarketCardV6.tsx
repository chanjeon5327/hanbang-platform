import Link from 'next/link';
import Image from 'next/image';
import styles from './market-list.module.css';

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
};

function formatKrw(n: number) {
  try {
    return new Intl.NumberFormat('ko-KR').format(Math.round(n));
  } catch {
    return String(Math.round(n));
  }
}

export default function MarketCardV6({ item }: { item: MarketItem }) {
  const up = (item.changePct ?? 0) >= 0;
  const pct = Math.abs(item.changePct ?? 0).toFixed(1);

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
          <span className={styles.badgePill}>안정형</span>
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
            {up ? '+' : '-'}{pct}%
          </div>
        </div>
      </div>
    </Link>
  );
}

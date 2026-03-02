'use client';

import Link from 'next/link';
import styles from './MarketTickerBar.module.css';
import { marketItems, formatKRW } from '@/lib/mock/marketItems';

export default function MarketTickerBar() {
  const items = marketItems.slice(0, 12);

  return (
    <div className="border-y border-black/10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 overflow-hidden">
        <div className={styles.track}>
          {[...items, ...items].map((it, idx) => {
            const up = it.chgPct >= 0;
            return (
              <Link
                key={`${it.id}-${idx}`}
                href={`/market/${it.id}`}
                className="flex items-center gap-2 text-sm text-black/70 hover:text-black transition"
              >
                <span className="font-extrabold text-black">{it.title}</span>
                <span className="tabular-nums">{formatKRW(it.price)}</span>
                <span className={`tabular-nums font-extrabold ${up ? 'text-emerald-600' : 'text-red-500'}`}>
                  {up ? '+' : ''}{it.chgPct.toFixed(1)}%
                </span>
                <span className="text-black/20">•</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

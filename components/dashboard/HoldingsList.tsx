'use client';

import Link from 'next/link';
import { formatKrw, formatRate } from '@/lib/utils/format';
import PortfolioDonutChart from '@/components/dashboard/PortfolioDonutChart';

export type Holding = {
  asset_id: string;
  title: string;
  quantity: number;
  avg_price: number;
  current_value: number;
  unrealized_rate: number;
};

type Props = {
  items: Holding[];
  isLocked?: boolean;
};

export default function HoldingsList({ items, isLocked }: Props) {
  if (items.length === 0) {
    return (
      <div
        className="rounded-2xl p-4 text-center"
        style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <p className="body-sm" style={{ color: 'var(--text-secondary)' }}>
          보유 종목이 없습니다
        </p>
      </div>
    );
  }

  const sorted = [...items].sort((a, b) => (b.unrealized_rate ?? 0) - (a.unrealized_rate ?? 0));
  const donutItems = sorted.map((p) => ({ asset_id: p.asset_id, title: p.title, current_value: p.current_value }));

  return (
    <div className="flex flex-col gap-3">
      {donutItems.length > 0 && (
        <div
          className="rounded-2xl p-4 mb-2"
          style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div className="caption font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>자산 비율</div>
          <PortfolioDonutChart items={donutItems} maxShow={5} />
        </div>
      )}
      {sorted.map((pos) => (
        <Link
          key={pos.asset_id}
          href={`/market/${pos.asset_id}`}
          className="block rounded-2xl p-4 transition active:opacity-90"
          style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="font-semibold body-sm" style={{ color: 'var(--text)' }}>
                {pos.title}
              </div>
              <div className="caption mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                {pos.quantity}주 · 평균 {isLocked ? '●●●' : formatKrw(pos.avg_price)}
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold tabular-nums body-sm" style={{ color: 'var(--text)' }}>
                {isLocked ? '●●●●●●' : formatKrw(pos.current_value)}
              </div>
              <div
                className="caption tabular-nums mt-0.5"
                style={{
                  color:
                    isLocked
                      ? 'var(--text-secondary)'
                      : (pos.unrealized_rate ?? 0) >= 0
                        ? 'var(--emerald)'
                        : 'var(--accent-loss)',
                }}
              >
                {isLocked ? '—' : formatRate(pos.unrealized_rate ?? 0)}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

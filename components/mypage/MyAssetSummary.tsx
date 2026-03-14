'use client';

import Link from 'next/link';
import { useWalletSummary } from '@/hooks/useWalletSummary';

const LEVEL_CONFIG = [
  { icon: '🐰', label: '토끼' },
  { icon: '🐴', label: '말' },
  { icon: '🐯', label: '표범' },
  { icon: '🦁', label: '사자' },
  { icon: '🦅', label: '독수리' },
] as const;

function getLevel(totalAssets: number): 1 | 2 | 3 | 4 | 5 {
  const man = totalAssets / 10000;
  if (man < 1000) return 1;
  if (man < 10000) return 2;
  if (man < 100000) return 3;
  if (man < 1000000) return 4;
  return 5;
}

function formatKRW(n: number): string {
  if (!Number.isFinite(n)) return '0원';
  if (n >= 100000000) return `${(n / 100000000).toFixed(1)}억원`;
  if (n >= 10000) return `${(n / 10000).toFixed(0)}만원`;
  return `${Math.round(n).toLocaleString()}원`;
}

function formatProfit(n: number): string {
  if (!Number.isFinite(n)) return '0원';
  const sign = n >= 0 ? '+' : '';
  return `${sign}${formatKRW(Math.abs(n))}`;
}

export default function MyAssetSummary() {
  const { data, loading, error } = useWalletSummary();

  if (loading) {
    return (
      <section className="px-4">
        <div className="rounded-2xl px-4 py-4 border bg-white border-[var(--toss-border)] shadow-[0_2px_8px_rgba(0,0,0,0.06)] animate-pulse">
          <div className="h-6 w-24 rounded bg-black/10 mb-2" />
          <div className="h-8 w-32 rounded bg-black/10" />
        </div>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="px-4">
        <div className="rounded-2xl px-4 py-4 border bg-white border-[var(--toss-border)] shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <p className="caption text-[var(--toss-text-secondary)]">나의 총 자산</p>
          <p className="text-sm text-[var(--toss-text-secondary)] mt-1">자산 정보를 불러올 수 없습니다.</p>
        </div>
      </section>
    );
  }

  const level = getLevel(data.totalAssets);
  const levelInfo = LEVEL_CONFIG[level - 1];

  return (
    <section className="px-4">
      <div className="rounded-2xl px-4 py-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[var(--toss-border)] bg-white">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="caption text-[var(--toss-text-secondary)]">나의 총 자산</div>
            <div className="flex items-baseline gap-3 mt-0.5">
              <div className="text-[22px] font-extrabold text-[var(--toss-text)] tabular-nums">
                {formatKRW(data.totalAssets)}
              </div>
              {data.profitRate !== 0 && (
                <div className={`text-[13px] font-semibold ${data.profitRate >= 0 ? 'text-[var(--accent-positive)]' : 'text-[var(--accent-loss,#ef4444)]'}`}>
                  {data.profitRate >= 0 ? '+' : ''}{data.profitRate.toFixed(2)}%
                </div>
              )}
            </div>
          </div>
          <div
            className="flex items-center gap-1.5 shrink-0 rounded-full border border-black/10 px-2.5 py-1.5 bg-black/[0.02]"
            title={levelInfo.label}
          >
            <span className="text-lg">{levelInfo.icon}</span>
            <span className="text-[11px] font-bold text-black/70">LV.{level}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="py-2 px-2 rounded-xl bg-[var(--toss-bg)] text-center">
            <div className="caption text-[var(--toss-text-secondary)]">상품 자산</div>
            <div className="text-[13px] font-semibold text-[var(--toss-text)] mt-0.5 tabular-nums">{formatKRW(data.holdingsValue)}</div>
          </div>
          <div className="py-2 px-2 rounded-xl bg-[var(--toss-bg)] text-center">
            <div className="caption text-[var(--toss-text-secondary)]">현금 자산</div>
            <div className="text-[13px] font-semibold text-[var(--toss-text)] mt-0.5 tabular-nums">{formatKRW(data.cashBalance)}</div>
          </div>
          <div className="py-2 px-2 rounded-xl bg-[var(--toss-bg)] text-center">
            <div className="caption text-[var(--toss-text-secondary)]">투자 중</div>
            <div className="text-[13px] font-semibold text-[var(--toss-text)] mt-0.5 tabular-nums">{formatKRW(data.holdingsValue)}</div>
          </div>
          <div className="py-2 px-2 rounded-xl bg-[var(--toss-bg)] text-center">
            <div className="caption text-[var(--toss-text-secondary)]">출금 가능</div>
            <div className="text-[13px] font-semibold text-[var(--toss-text)] mt-0.5 tabular-nums">{formatKRW(data.cashBalance)}</div>
          </div>
          <div className="py-2 px-2 rounded-xl bg-[var(--toss-bg)] text-center col-span-2">
            <div className="caption text-[var(--toss-text-secondary)]">수익</div>
            <div className={`text-[13px] font-semibold mt-0.5 tabular-nums ${data.profit >= 0 ? 'text-[var(--accent-positive)]' : 'text-[var(--accent-loss,#ef4444)]'}`}>
              {formatProfit(data.profit)}
            </div>
          </div>
        </div>

        <Link
          href="/wallet"
          className="mt-3 block w-full py-2.5 rounded-xl text-center text-[13px] font-semibold text-[var(--royal-blue)] border border-[var(--royal-blue)]/30 hover:bg-[var(--royal-blue)]/10 transition"
        >
          지갑 보기
        </Link>
      </div>
    </section>
  );
}

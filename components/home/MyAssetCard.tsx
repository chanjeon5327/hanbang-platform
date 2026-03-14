'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getBrowserSupabase } from '@/utils/supabase/client';

/** 금액 포맷 (만원 단위 생략 가능) */
function formatKRW(n: number): string {
  if (!Number.isFinite(n)) return '0원';
  if (n >= 100000000) return `${(n / 100000000).toFixed(1)}억원`;
  if (n >= 10000) return `${(n / 10000).toFixed(0)}만원`;
  return `${Math.round(n).toLocaleString()}원`;
}

/** 총 자산 기준 레벨 1~5 (LevelCard 규칙과 동일: 만원 단위) */
function getLevelFromTotalAssets(totalAssets: number): 1 | 2 | 3 | 4 | 5 {
  const man = totalAssets / 10000; // 만원
  if (man < 1000) return 1;
  if (man < 10000) return 2;
  if (man < 100000) return 3;
  if (man < 1000000) return 4;
  return 5;
}

const LEVEL_CONFIG = [
  { icon: '🐰', label: '토끼' },
  { icon: '🐴', label: '말' },
  { icon: '🐯', label: '표범' },
  { icon: '🦁', label: '사자' },
  { icon: '🦅', label: '독수리' },
] as const;

type WalletSummary = {
  totalAssets: number;
  holdingsValue: number;
  cashBalance: number;
};

export default function MyAssetCard() {
  const [email, setEmail] = useState<string | null>(null);
  const [summary, setSummary] = useState<WalletSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const supabase = getBrowserSupabase();
        const { data } = await supabase.auth.getSession();
        const hasUser = !!data.session?.user;
        if (!alive) return;
        setEmail(hasUser ? (data.session!.user!.email as string) : null);

        if (!hasUser) {
          setLoading(false);
          return;
        }

        const res = await fetch('/api/wallet/summary', { cache: 'no-store' });
        if (!alive) return;
        if (res.ok) {
          try {
            const json = await res.json();
            setSummary({
              totalAssets: Number(json.totalAssets) || 0,
              holdingsValue: Number(json.holdingsValue) || 0,
              cashBalance: Number(json.cashBalance) || 0,
            });
          } catch {
            setSummary({ totalAssets: 0, holdingsValue: 0, cashBalance: 0 });
          }
        } else {
          setSummary({ totalAssets: 0, holdingsValue: 0, cashBalance: 0 });
        }
      } catch {
        if (alive) setSummary({ totalAssets: 0, holdingsValue: 0, cashBalance: 0 });
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const loggedIn = !!email;

  return (
    <section className="px-5 sm:px-6 py-10 sm:py-12 max-w-7xl mx-auto">
      <div className={`rounded-2xl border border-black/10 bg-white shadow-[0_6px_20px_rgba(0,0,0,0.05)] ${loggedIn ? 'px-5 sm:px-6 py-4 sm:py-5' : 'p-5 sm:p-6'}`}>
        {!loggedIn ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="text-xs text-black/50">내 자산</div>
              <div className="mt-2 text-xl sm:text-2xl font-extrabold tracking-[-0.3px]">
                지금 가입하고, 당신의 콘텐츠를 소유하세요.
              </div>
              <div className="mt-2 text-sm text-black/55">
                가입/로그인 후 내 자산·보유 종목·등급이 실시간으로 표시됩니다.
              </div>
            </div>

            <div className="flex gap-3">
              <Link href="/login?mode=signup&redirect=/" className="px-5 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-extrabold transition">
                가입하기
              </Link>
              <Link href="/login?redirect=/" className="px-5 py-3 rounded-xl bg-black/5 hover:bg-black/10 border border-black/10 text-sm font-bold transition">
                로그인
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 sm:gap-8">
            {/* 좌측: 내 자산 + 총/상품/현금 자산 (넉넉한 간격) */}
            <div className="flex-1 min-w-0">
              <div className="text-[11px] text-black/50 mb-2">내 자산</div>
              <div className="flex flex-wrap items-baseline gap-4 sm:gap-0">
                {/* 총 자산 (가장 큼, 왼쪽 고정) */}
                {loading ? (
                  <div className="h-8 w-28 animate-pulse rounded bg-black/5" />
                ) : (
                  <div className="min-w-0">
                    <div className="text-[10px] text-black/40 uppercase tracking-wide mb-1">총 자산</div>
                    <div className="text-2xl sm:text-3xl font-extrabold tabular-nums tracking-tight text-black/90">
                      {formatKRW(summary?.totalAssets ?? 0)}
                    </div>
                  </div>
                )}
                {/* 상품 자산 (데스크톱에서 우측으로 크게 밀림) */}
                {!loading && summary && (
                  <div className="sm:ml-32">
                    <div className="text-[10px] text-black/40 uppercase tracking-wide mb-1">상품 자산</div>
                    <div className="text-sm font-semibold tabular-nums text-black/75">
                      {formatKRW(summary.holdingsValue)}
                    </div>
                  </div>
                )}
                {/* 현금 자산 (상품 자산보다 더 우측으로 밀림) */}
                {!loading && summary && (
                  <div className="sm:ml-48">
                    <div className="text-[10px] text-black/40 uppercase tracking-wide mb-1">현금 자산</div>
                    <div className="text-sm font-semibold tabular-nums text-black/75">
                      {formatKRW(summary.cashBalance)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 우측: 레벨 배지 + 지갑 보기 (카드 맨 끝 정렬) */}
            <div className="flex items-center gap-3 shrink-0 ml-auto sm:pl-6">
              {summary && !loading && (
                <div
                  className="flex items-center gap-1.5 rounded-full border border-black/10 bg-black/[0.02] px-2.5 py-1.5"
                  title={LEVEL_CONFIG[getLevelFromTotalAssets(summary.totalAssets) - 1].label}
                  aria-hidden
                >
                  <span className="text-lg">
                    {LEVEL_CONFIG[getLevelFromTotalAssets(summary.totalAssets) - 1].icon}
                  </span>
                  <span className="text-[11px] font-bold text-black/70">
                    LV.{getLevelFromTotalAssets(summary.totalAssets)}
                  </span>
                </div>
              )}
              <Link
                href="/wallet"
                className="px-4 py-2 rounded-lg text-[13px] font-semibold text-[#2563EB] hover:bg-[#2563EB]/10 border border-[#2563EB]/30 transition"
              >
                지갑 보기
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

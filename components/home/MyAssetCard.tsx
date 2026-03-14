'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getBrowserSupabase } from '@/utils/supabase/client';
import { useWalletSummary } from '@/hooks/useWalletSummary';

/** 금액 포맷 (만원 단위 생략 가능) */
function formatKRW(n: number): string {
  if (!Number.isFinite(n)) return '0원';
  if (n >= 100000000) return `${(n / 100000000).toFixed(1)}억원`;
  if (n >= 10000) return `${(n / 10000).toFixed(0)}만원`;
  return `${Math.round(n).toLocaleString()}원`;
}

/** 수익 포맷 (+/- 포함) */
function formatProfit(n: number): string {
  if (!Number.isFinite(n)) return '0원';
  const sign = n >= 0 ? '+' : '';
  if (Math.abs(n) >= 100000000) return `${sign}${(n / 100000000).toFixed(1)}억원`;
  if (Math.abs(n) >= 10000) return `${sign}${(n / 10000).toFixed(0)}만원`;
  return `${sign}${Math.round(n).toLocaleString()}원`;
}

/** 총 자산 기준 레벨 1~5 (LevelCard 규칙과 동일: 만원 단위) */
function getLevelFromTotalAssets(totalAssets: number): 1 | 2 | 3 | 4 | 5 {
  const man = totalAssets / 10000;
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

export default function MyAssetCard() {
  const [email, setEmail] = useState<string | null>(null);
  const { data: summary, loading, error } = useWalletSummary();

  useEffect(() => {
    let alive = true;
    (async () => {
      const supabase = getBrowserSupabase();
      const { data } = await supabase.auth.getSession();
      if (!alive) return;
      setEmail(!!data.session?.user ? (data.session!.user!.email as string) : null);
    })();
    return () => { alive = false; };
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
            {/* 좌측: 내 자산 + 6개 항목 */}
            <div className="flex-1 min-w-0">
              <div className="text-[11px] text-black/50 mb-2">내 자산</div>

              {/* 1행: 총 자산 (가장 큼) */}
                  <div className="mb-2">
                    {loading ? (
                      <div className="h-8 w-28 animate-pulse rounded bg-black/5" />
                    ) : (
                      <div>
                        <div className="text-[10px] text-black/40 uppercase tracking-wide mb-0.5">나의 총자산</div>
                        <div className="text-2xl sm:text-3xl font-extrabold tabular-nums tracking-tight text-black/90">
                          {formatKRW(summary?.totalAssets ?? 0)}
                        </div>
                      </div>
                    )}
                  </div>

              {/* 2행: 상품자산, 현금자산, 투자중, 출금가능액, 수익 (보조) */}
              {!loading && (
                <div className="flex flex-wrap items-baseline gap-x-6 sm:gap-x-8 gap-y-8">
                  <div>
                    <div className="text-[10px] text-black/40 uppercase tracking-wide mb-0.5">상품 자산</div>
                    <div className="text-sm font-semibold tabular-nums text-black/75">{formatKRW(summary?.holdingsValue ?? 0)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-black/40 uppercase tracking-wide mb-0.5">현금 자산</div>
                    <div className="text-sm font-semibold tabular-nums text-black/75">{formatKRW(summary?.cashBalance ?? 0)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-black/40 uppercase tracking-wide mb-0.5">투자 중</div>
                    <div className="text-sm font-semibold tabular-nums text-black/75">{formatKRW(summary?.holdingsValue ?? 0)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-black/40 uppercase tracking-wide mb-0.5">출금 가능액</div>
                    <div className="text-sm font-semibold tabular-nums text-black/75">{formatKRW(summary?.cashBalance ?? 0)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-black/40 uppercase tracking-wide mb-0.5">수익</div>
                    <div className={`text-sm font-semibold tabular-nums ${(summary?.profit ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {formatProfit(summary?.profit ?? 0)}
                    </div>
                  </div>
                </div>
              )}
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

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getBrowserSupabase } from '@/utils/supabase/client';

export default function MyAssetCard() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const supabase = getBrowserSupabase();
        const { data } = await supabase.auth.getSession();
        const e = data.session?.user?.email ?? null;
        if (alive) setEmail(e);
      } catch {
        // ignore
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const loggedIn = !!email;

  return (
    <section className="px-5 sm:px-6 py-10 sm:py-12 max-w-7xl mx-auto">
      <div className="rounded-2xl border border-black/10 bg-white p-5 sm:p-6 shadow-[0_6px_20px_rgba(0,0,0,0.05)]">
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
              <Link href="/signup" className="px-5 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-extrabold transition">
                가입하기
              </Link>
              <Link href="/login" className="px-5 py-3 rounded-xl bg-black/5 hover:bg-black/10 border border-black/10 text-sm font-bold transition">
                로그인
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="text-xs text-black/50">내 자산</div>
              <div className="mt-2 text-xl sm:text-2xl font-extrabold tracking-[-0.3px]">
                보유 자산과 수익을 한눈에 확인하세요.
              </div>
              <div className="mt-2 text-sm text-black/55">
                보유 종목 · 수익률 · 배당 내역을 지갑에서 확인할 수 있습니다.
              </div>
            </div>

            <div className="flex gap-3">
              <Link href="/wallet" className="px-5 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-extrabold transition">
                지갑 보기
              </Link>
              <Link href="/market" className="px-5 py-3 rounded-xl bg-black/5 hover:bg-black/10 border border-black/10 text-sm font-bold transition">
                마켓 보기
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

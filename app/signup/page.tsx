'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

type SignupResult = { ok?: boolean; error?: string };

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    if (!email.trim()) return false;
    if (pw.length < 6) return false;
    if (pw !== pw2) return false;
    return true;
  }, [email, pw, pw2]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!canSubmit) {
      if (!email.trim()) return setErr('이메일을 입력해 주세요.');
      if (pw.length < 6) return setErr('비밀번호는 6자 이상이어야 합니다.');
      if (pw !== pw2) return setErr('비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: pw }),
      });

      let data: SignupResult | null = null;
      try {
        data = (await res.json()) as SignupResult;
      } catch {
        data = null;
      }

      if (!res.ok || !data?.ok) {
        const msg =
          data?.error ||
          (res.status === 404
            ? '가입 API(/api/auth/signup)를 찾지 못했습니다. (연결 필요)'
            : '가입에 실패했습니다. 잠시 후 다시 시도해 주세요.');
        setErr(msg);
        return;
      }

      // ✅ 가입 성공 → 온보딩으로
      router.push('/onboarding');
    } catch {
      setErr('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-56px)] px-4 py-10">
      {/* 홈 히어로 톤 유지: 시네마 다크 + 블루 글로우 */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#050b1f] to-black opacity-95" />
        <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -bottom-40 right-[-120px] h-[520px] w-[520px] rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      <section className="mx-auto w-full max-w-md">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            3초 후, 당신은 콘텐츠 동업자가 됩니다.
          </h1>
          <p className="mt-2 text-sm text-white/70">
            좋아하는 크리에이터의 수익을 함께 나누세요.
          </p>
        </header>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_16px_60px_rgba(0,0,0,0.45)] backdrop-blur">
          {/* 소셜은 로그인 페이지로 위임(이미 동작한다고 했던 흐름 유지) */}
          <div className="space-y-2">
            <Link
              href="/login"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Google / Kakao로 시작하기
            </Link>
            <p className="text-center text-xs text-white/60">
              소셜 가입/로그인은 로그인 페이지에서 처리됩니다.
            </p>
          </div>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-white/40">또는 이메일로 가입</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-white/70">이메일</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/20"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-white/70">비밀번호</label>
              <input
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="6자 이상"
                type="password"
                autoComplete="new-password"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/20"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-white/70">비밀번호 확인</label>
              <input
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                placeholder="비밀번호를 한번 더 입력"
                type="password"
                autoComplete="new-password"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/20"
              />
            </div>

            {err ? (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {err}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={!canSubmit || loading}
              className="mt-2 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-extrabold text-white disabled:opacity-50"
            >
              {loading ? '가입 중…' : '가입하고 시작하기'}
            </button>

            <p className="pt-2 text-center text-xs text-white/60">
              이미 계정이 있으신가요?{' '}
              <Link href="/login" className="font-semibold text-white hover:underline">
                로그인
              </Link>
            </p>
          </form>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-2">
          <BenefitItem title="조각 투자 참여" desc="좋아하는 콘텐츠의 일부를 내 자산으로" />
          <BenefitItem title="월 수익 분배" desc="보유 중이면 수익이 들어오는 구조" />
          <BenefitItem title="2차 거래" desc="원할 때 사고팔 수 있는 마켓" />
        </div>

        <p className="mt-6 text-center text-xs text-white/35">
          가입 완료 시 /onboarding 으로 자동 이동합니다.
        </p>
      </section>
    </main>
  );
}

function BenefitItem({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur">
      <div className="text-sm font-extrabold">{title}</div>
      <div className="mt-1 text-xs text-white/65">{desc}</div>
    </div>
  );
}

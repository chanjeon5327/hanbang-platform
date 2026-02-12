'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

/* 업비트 사용법 레퍼런스: 단계형(스텝퍼) + 상태 배지 + CTA */
const UPBIT = { bg: '#0d0d0d', panel: '#161616', border: '#2b2b2b', bid: '#1e88e5', text: '#e0e0e0', dim: '#8e8e8e' };

const STEPS = [
  { id: 1, label: '회원가입', desc: '이메일 또는 소셜 로그인' },
  { id: 2, label: '고객확인', desc: 'KRW 입출금을 위한 본인인증' },
  { id: 3, label: '원화입금', desc: '예수금 충전 후 거래 시작' },
];

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const check = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      if (data.session) router.replace('/');
    };
    check();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    try {
      if (mode === 'login') {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        router.replace('/');
      } else {
        const { error: err } = await supabase.auth.signUp({ email, password });
        if (err) throw err;
        setError('가입 완료. 이메일 인증 링크를 확인하세요.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: UPBIT.bg }}>
      <header className="sticky top-0 z-50 border-b px-4 py-3 flex items-center justify-between" style={{ backgroundColor: UPBIT.bg, borderColor: UPBIT.border }}>
        <Link href="/" className="text-sm" style={{ color: UPBIT.dim }}>‹ 뒤로</Link>
        <span className="text-[12px] px-2 py-1 rounded" style={{ backgroundColor: UPBIT.panel, color: UPBIT.dim }}>KRW 마켓</span>
      </header>

      <main className="px-4 py-6">
        <h1 className="text-[22px] font-bold mb-1" style={{ color: UPBIT.text }}>HANBANG 로그인</h1>
        <p className="text-[14px] mb-6" style={{ color: UPBIT.dim }}>수익권 거래를 위해 로그인해주세요</p>

        {/* 스텝퍼 */}
        <div className="rounded-[12px] border p-4 mb-6" style={{ backgroundColor: UPBIT.panel, borderColor: UPBIT.border }}>
          <div className="text-[12px] font-semibold mb-3" style={{ color: UPBIT.dim }}>가입 절차</div>
          <div className="space-y-3">
            {STEPS.map((s) => (
              <div key={s.id} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0"
                  style={{
                    backgroundColor: step >= s.id ? UPBIT.bid : UPBIT.border,
                    color: step >= s.id ? '#fff' : UPBIT.dim,
                  }}
                >
                  {step > s.id ? '✓' : s.id}
                </div>
                <div className="flex-1">
                  <div className="text-[14px] font-semibold" style={{ color: UPBIT.text }}>{s.label}</div>
                  <div className="text-[12px]" style={{ color: UPBIT.dim }}>{s.desc}</div>
                </div>
                {step === s.id && (
                  <span className="text-[10px] px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(30,136,229,0.2)', color: UPBIT.bid }}>현재</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 로그인/가입 폼 */}
        <div className="rounded-[12px] border p-4" style={{ backgroundColor: UPBIT.panel, borderColor: UPBIT.border }}>
          <div className="flex rounded-lg overflow-hidden mb-4" style={{ backgroundColor: UPBIT.bg }}>
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className="flex-1 py-2.5 text-[14px] font-semibold transition"
              style={{ backgroundColor: mode === 'login' ? UPBIT.bid : 'transparent', color: mode === 'login' ? '#fff' : UPBIT.dim }}
            >
              로그인
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); }}
              className="flex-1 py-2.5 text-[14px] font-semibold transition"
              style={{ backgroundColor: mode === 'signup' ? UPBIT.bid : 'transparent', color: mode === 'signup' ? '#fff' : UPBIT.dim }}
            >
              회원가입
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일"
              required
              className="w-full rounded-lg px-4 py-3 text-[15px] focus:outline-none border"
              style={{ backgroundColor: UPBIT.bg, borderColor: UPBIT.border, color: UPBIT.text }}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              required
              className="w-full rounded-lg px-4 py-3 text-[15px] focus:outline-none border"
              style={{ backgroundColor: UPBIT.bg, borderColor: UPBIT.border, color: UPBIT.text }}
            />
            {error && <p className="text-[13px]" style={{ color: '#e53935' }}>{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-lg text-white text-[16px] font-bold transition disabled:opacity-50"
              style={{ backgroundColor: UPBIT.bid }}
            >
              {loading ? '처리 중…' : mode === 'login' ? '로그인' : '회원가입'}
            </button>
          </form>
        </div>

        <p className="text-[12px] text-center mt-6" style={{ color: UPBIT.dim }}>
          로그인 시 이용약관 및 개인정보처리방침에 동의합니다.
        </p>
      </main>
    </div>
  );
}

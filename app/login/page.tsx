'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { login } from '@/lib/auth/client';
import { useToast } from '@/context/ToastContext';
import { HBCard } from '@/components/ui/HBCard';

/* AUTH Phase-2: 로그인 이유 메시지 */
const REASON_MSG: Record<string, string> = {
  concurrent:   '다른 기기에서 로그인하여 현재 세션이 종료되었습니다.',
  force_logout: '관리자에 의해 로그아웃 처리되었습니다.',
};

function LoginForm() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(reason ? REASON_MSG[reason] ?? null : null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    const emailTrimmed = email.trim();
    if (!emailTrimmed || !emailTrimmed.includes('@')) {
      setError('올바른 이메일 주소를 입력해주세요.');
      return;
    }
    if (!password || password.length < 1) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await login(emailTrimmed, password);

    if (result.ok) {
      toast('로그인에 성공했습니다.');
      const next = searchParams.get('next');
      router.replace(next && next.startsWith('/') ? next : '/');
      return;
    }

    setError(result.error);
    setLoading(false);
  }

  return (
    <HBCard variant="elevated">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일"
            autoComplete="email"
            className="w-full px-4 py-3 rounded-[12px] border outline-none transition-all"
            style={{
              backgroundColor: 'var(--bg)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
            required
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            autoComplete="current-password"
            className="w-full px-4 py-3 rounded-[12px] border outline-none transition-all"
            style={{
              backgroundColor: 'var(--bg)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
            required
          />
        </div>

        {/* 에러/이유 메시지 */}
        {error && (
          <div
            className="px-3 py-2 rounded-xl text-sm"
            style={{
              background: 'rgba(220,38,38,0.08)',
              color: 'var(--accent-loss)',
              border: '1px solid rgba(220,38,38,0.2)',
            }}
          >
            {error}
          </div>
        )}

        {/* 로그인 버튼 */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-[16px] font-bold flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50 tap-scale"
          style={{
            backgroundColor: 'var(--royal-blue)',
            color: '#fff',
            boxShadow: 'var(--shadow-royal)',
          }}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              로그인 중...
            </>
          ) : (
            '로그인'
          )}
        </button>
      </form>

      <div className="mt-5 pt-4 border-t space-y-2 text-center" style={{ borderColor: 'var(--border)' }}>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          비밀번호를 잊으셨나요?{' '}
          <Link href="/forgot-password" className="font-semibold" style={{ color: 'var(--royal-blue)' }}>
            비밀번호 찾기
          </Link>
        </p>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          계정이 없으신가요?{' '}
          <Link href="/signup" className="font-semibold" style={{ color: 'var(--royal-blue)' }}>
            회원가입
          </Link>
        </p>
      </div>
    </HBCard>
  );
}

export default function LoginPage() {
  return (
    <div
      className="flex justify-center items-center min-h-screen px-4"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      <div className="w-full max-w-md hb-stagger">
        {/* 브랜드 헤더 */}
        <div className="text-center mb-8">
          <div
            className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3"
            style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--royal-blue)' }}
          >
            HANBANG
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            로그인
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            플랫폼에 오신 것을 환영합니다
          </p>
        </div>

        {/* Suspense: useSearchParams 사용 컴포넌트 감싸기 (Next.js 요구사항) */}
        <Suspense fallback={<HBCard variant="elevated"><div className="h-48 animate-pulse" style={{ background: 'var(--bg-secondary)' }} /></HBCard>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}

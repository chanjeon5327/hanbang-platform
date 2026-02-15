'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login } from '@/lib/auth/client';
import { useToast } from '@/context/ToastContext';

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);

    const result = await login(email, password);

    if (result.ok) {
      toast('로그인되었습니다.');
      router.replace('/');
      return;
    }

    setError(result.error);
    setLoading(false);
  }

  return (
    <div className="flex justify-center items-center min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <div
        className="rounded-[16px] p-8 w-full max-w-md border card"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <h2 className="text-[22px] font-bold mb-2 text-center" style={{ color: 'var(--text)' }}>
          엔젤 로그인
        </h2>
        <p className="text-[13px] text-center mb-6" style={{ color: 'var(--text-secondary)' }}>
          HANBANG에서 안전하게 엔젤 투자를 시작하세요
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일"
            className="w-full px-4 py-3 rounded-[12px] border"
            style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
            required
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            className="w-full px-4 py-3 rounded-[12px] border"
            style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
            required
          />

          {error && (
            <p className="text-[13px]" style={{ color: 'var(--accent-loss)' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-[16px] font-bold tap-scale disabled:opacity-50"
            style={{
              backgroundColor: 'var(--royal-blue)',
              color: '#fff',
              boxShadow: 'var(--shadow-royal)',
            }}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <p className="text-[13px] text-center mt-6" style={{ color: 'var(--text-secondary)' }}>
          계정이 없으신가요?{' '}
          <Link href="/signup" className="font-semibold" style={{ color: 'var(--royal-blue)' }}>
            엔젤 회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}

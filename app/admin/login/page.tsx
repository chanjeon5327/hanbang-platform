'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { login } from '@/lib/auth/client';

function AdminLoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get('redirect') ?? '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    const result = await login(email, password);
    setLoading(false);

    if (result.ok) {
      router.replace(redirect);
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="p-4" data-testid="admin-login-page">
      <h1 className="mb-4 h3 font-bold">관리자 로그인</h1>

      <input
        className="mb-2 w-full rounded border px-3 py-2"
        placeholder="이메일"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="mb-4 w-full rounded border px-3 py-2"
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && <p className="mb-2 text-sm text-red-500">{error}</p>}
      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full rounded bg-black py-3 text-white disabled:opacity-60"
      >
        {loading ? '로그인 중…' : '관리자 로그인'}
      </button>
      <p className="mt-4 text-center text-sm text-gray-500">
        <Link href="/forgot-password" className="hover:underline">
          비밀번호 찾기
        </Link>
      </p>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="p-4"><p>로딩 중...</p></div>}>
      <AdminLoginContent />
    </Suspense>
  );
}

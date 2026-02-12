'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

function AdminLoginContent() {
  const supabase = createClient();
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get('redirect') ?? '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (!error) {
      router.replace(redirect);
    } else {
      alert('로그인 실패');
    }
  };

  return (
    <main className="p-4" data-testid="admin-login-page">
      <h1 className="mb-4 text-[20px] font-bold">관리자 로그인</h1>

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

      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full rounded bg-black py-3 text-white"
      >
        {loading ? '로그인 중…' : '관리자 로그인'}
      </button>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<main className="p-4"><p>로딩 중...</p></main>}>
      <AdminLoginContent />
    </Suspense>
  );
}

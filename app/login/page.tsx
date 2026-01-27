'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/';

  const handleLogin = async () => {
    if (loading) return;

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    router.replace(from);
  };

  return (
    <div style={{ padding: 24, maxWidth: 360 }}>
      <h2>로그인</h2>

      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="email"
        disabled={loading}
        style={{ width: '100%', marginBottom: 8 }}
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="password"
        disabled={loading}
        style={{ width: '100%', marginBottom: 12 }}
      />

      <button
        type="button"
        onClick={handleLogin}
        disabled={loading}
        style={{
          width: '100%',
          padding: '10px 0',
          fontWeight: 700,
          opacity: loading ? 0.6 : 1,
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? '로그인 중...' : '로그인'}
      </button>

      {loading && (
        <p style={{ marginTop: 10, fontSize: 12, color: '#666' }}>
          인증 처리 중입니다. 잠시만 기다려 주세요.
        </p>
      )}
    </div>
  );
}

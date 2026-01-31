'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

type LoginModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function LoginModal({
  open,
  onOpenChange,
}: LoginModalProps) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    onOpenChange(false); // ✅ 로그인 성공 → 모달 닫힘
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          width: 360,
          background: '#fff',
          padding: 24,
          borderRadius: 8,
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
          로그인
        </h2>

        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: 10, marginBottom: 8 }}
        />

        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: 10, marginBottom: 12 }}
        />

        {error && (
          <div style={{ color: 'red', fontSize: 13, marginBottom: 8 }}>
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%',
            padding: 12,
            background: '#000',
            color: '#fff',
            fontWeight: 600,
          }}
        >
          {loading ? '로그인 중...' : '이메일로 로그인'}
        </button>

        <button
          onClick={() => onOpenChange(false)}
          style={{
            width: '100%',
            padding: 10,
            marginTop: 8,
            background: '#eee',
          }}
        >
          닫기
        </button>
      </div>
    </div>
  );
}

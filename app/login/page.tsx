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
      toast('????????.');
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
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <h2 className="h2 font-bold mb-2 text-center" style={{ color: 'var(--text)' }}>
          ???
        </h2>
        <p className="body-sm text-center mb-6" style={{ color: 'var(--text-secondary)' }}>
          HANBANG? ????? ??? ?????
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="???"
            className="w-full px-4 py-3 rounded-[12px] border"
            style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
            required
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="????"
            className="w-full px-4 py-3 rounded-[12px] border"
            style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
            required
          />

          {error && (
            <p className="body-sm" style={{ color: 'var(--accent-loss)' }}>{error}</p>
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
            {loading ? '??? ?...' : '???'}
          </button>
        </form>

        <p className="body-sm text-center mt-6" style={{ color: 'var(--text-secondary)' }}>
          ????? ??????{' '}
          <Link href="/forgot-password" className="font-semibold" style={{ color: 'var(--royal-blue)' }}>
            ???? ??
          </Link>
        </p>
        <p className="body-sm text-center mt-2" style={{ color: 'var(--text-secondary)' }}>
          ??? ??????{' '}
          <Link href="/signup" className="font-semibold" style={{ color: 'var(--royal-blue)' }}>
            ????
          </Link>
        </p>
      </div>
    </div>
  );
}

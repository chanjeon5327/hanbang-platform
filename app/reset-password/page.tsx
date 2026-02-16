'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function ResetPasswordPage() {
  const supabase = createClient();
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const url = window.location.href;
      const hasCode = url.includes('code=') || url.includes('#');

      if (hasCode) {
        const { error } = await supabase.auth.exchangeCodeForSession(url);
        if (error) {
          router.replace('/admin/login');
          return;
        }
      } else {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.replace('/admin/login');
          return;
        }
      }

      setReady(true);
    }

    init();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password.length < 6) {
      setError('6자 이상 입력하세요.');
      return;
    }

    if (password !== confirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      return;
    }

    router.replace('/admin/login');
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>처리 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="w-[360px] bg-white p-6 rounded-xl shadow-md space-y-4"
      >
        <h1 className="text-lg font-bold text-center">새 비밀번호 설정</h1>

        {error && (
          <div className="text-sm text-red-500 text-center">{error}</div>
        )}

        <input
          type="password"
          placeholder="새 비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
        />

        <input
          type="password"
          placeholder="비밀번호 확인"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
        />

        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded-lg"
        >
          변경하기
        </button>
      </form>
    </div>
  );
}

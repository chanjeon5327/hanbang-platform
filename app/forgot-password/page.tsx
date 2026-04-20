'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getBrowserSupabase } from '@/utils/supabase/client';

export default function ForgotPasswordPage() {
  const supabase = getBrowserSupabase();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-[360px] bg-white p-6 rounded-xl shadow-md text-center">
          <h1 className="text-lg font-bold mb-4">이메일을 확인해주세요</h1>
          <p className="text-sm text-gray-600 mb-6">
            {email}로 비밀번호 재설정 링크를 보냈습니다.
          </p>
          <Link
            href="/login"
            className="block w-full py-2 rounded-lg bg-black text-white text-center"
          >
            로그인으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-[360px] bg-white p-6 rounded-xl shadow-md space-y-4"
      >
        <h1 className="text-lg font-bold text-center">비밀번호 찾기</h1>
        <p className="text-sm text-gray-500 text-center">
          가입한 이메일을 입력하면 재설정 링크를 보내드립니다.
        </p>

        {error && (
          <div className="text-sm text-red-500 text-center">{error}</div>
        )}

        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded-lg disabled:opacity-50"
        >
          {loading ? '전송 중...' : '재설정 링크 보내기'}
        </button>

        <Link
          href="/login"
          className="block text-center text-sm text-gray-500 hover:text-gray-700"
        >
          로그인으로 돌아가기
        </Link>
      </form>
    </div>
  );
}

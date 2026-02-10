'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('chanjeon5327@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email || !password) return alert('이메일/비밀번호 입력');
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);

    if (!ok) {
      alert('관리자 로그인 실패 (Invalid login credentials)');
      return;
    }

    router.push('/admin');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 헤더 */}
      <div className="relative flex items-center justify-center h-[60px] px-4">
        <button
          onClick={() => router.back()}
          className="absolute left-4 p-2 -ml-2 text-slate-900"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-2 text-slate-900 font-bold">
          <Shield size={18} />
          ADMIN
        </div>
      </div>

      <div className="flex-1 px-5 pt-10 pb-10 flex flex-col max-w-[480px] mx-auto w-full">
        <h1 className="text-2xl font-bold text-slate-900 text-center mb-8">
          관리자 로그인
        </h1>

        <div className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="관리자 이메일"
            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 text-slate-900 outline-none focus:border-black focus:bg-white transition-all placeholder:text-gray-400"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="관리자 비밀번호"
            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 text-slate-900 outline-none focus:border-black focus:bg-white transition-all placeholder:text-gray-400"
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit();
            }}
          />

          <button
            onClick={submit}
            disabled={loading}
            className="w-full bg-[#191F28] text-white py-4 rounded-xl font-bold active:scale-[0.98] transition-transform mt-2 disabled:opacity-50"
          >
            {loading ? '로그인 중...' : '관리자 로그인'}
          </button>

          <div className="text-xs text-gray-400 pt-2 text-center">
            * 관리자 로그인은 AuthContext의 MASTER_ACCOUNT(role=5)로만 통과합니다.
          </div>
        </div>
      </div>
    </div>
  );
}

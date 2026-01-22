'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MessageCircle, Globe, Wallet } from 'lucide-react';
import { createBrowserClientCompat } from "@/lib/supabase/client";


const supabase = createBrowserClientCompat();

type ActiveTab = 'investor' | 'creator';
type AuthMode = 'login' | 'signup';

export default function LoginPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<ActiveTab>('investor');
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const redirectTo = 'http://localhost:3000/auth/callback';

  /* =========================
     OAuth 로그인
     ========================= */

  const handleKakaoLogin = async () => {
    setIsLoading('kakao');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: { redirectTo },
    });

    if (error) {
      alert(error.message);
      setIsLoading(null);
    }
    // ✅ 여기서 끝 (리다이렉트 시작)
  };

  const handleGoogleLogin = async () => {
    setIsLoading('google');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });

    if (error) {
      alert(error.message);
      setIsLoading(null);
    }
  };

  /* =========================
     이메일 로그인 / 회원가입
     ========================= */

  const handleEmailSubmit = async () => {
    if (!email || !password) return alert('이메일과 비밀번호를 입력해주세요.');
    setIsLoading('email');

    if (authMode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert(error.message);
        setIsLoading(null);
        return;
      }

      router.replace('/admin');
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectTo,
          data: { userType: activeTab },
        },
      });

      if (error) {
        alert(error.message);
      } else {
        alert('회원가입 완료. 이메일 인증을 확인해주세요.');
        setAuthMode('login');
      }
      setIsLoading(null);
    }
  };

  /* =========================
     메타마스크 (보조 인증)
     ========================= */

  const handleWalletLogin = async () => {
    setIsLoading('wallet');
    const eth = (window as any).ethereum;

    if (!eth) {
      alert('메타마스크가 설치되어 있지 않습니다.');
      setIsLoading(null);
      return;
    }

    await eth.request({ method: 'eth_requestAccounts' });
    alert('지갑 연결 완료 (로그인은 별도 필요)');
    setIsLoading(null);
  };

  /* =========================
     UI
     ========================= */

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="relative flex items-center justify-center h-[60px] px-4">
        <button onClick={() => router.back()} className="absolute left-4 p-2">
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="flex-1 px-5 pt-4 pb-10 max-w-[480px] mx-auto w-full">
        <h1 className="text-2xl font-bold text-center mb-6">
          관리자 로그인
        </h1>

        <div className="space-y-3 mb-8">
          <button onClick={handleKakaoLogin} className="w-full bg-[#FEE500] py-4 rounded-xl font-bold">
            <MessageCircle className="inline mr-2" /> 카카오 로그인
          </button>

          <button onClick={handleGoogleLogin} className="w-full border py-4 rounded-xl font-bold">
            <Globe className="inline mr-2" /> 구글 로그인
          </button>

          <button onClick={handleWalletLogin} className="w-full bg-[#3182F6] text-white py-4 rounded-xl font-bold">
            <Wallet className="inline mr-2" /> 지갑 연결
          </button>
        </div>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일"
          className="w-full border p-3 rounded mb-2"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
          className="w-full border p-3 rounded mb-4"
        />

        <button onClick={handleEmailSubmit} className="w-full bg-black text-white py-4 rounded-xl">
          {authMode === 'login' ? '로그인' : '회원가입'}
        </button>
      </div>
    </div>
  );
}

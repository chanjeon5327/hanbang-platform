'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MessageCircle, Globe, Wallet } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useStore } from '@/context/StoreContext';

type RoleTab = 'investor' | 'creator';
type Mode = 'login' | 'signup';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useStore();

  const [activeTab, setActiveTab] = useState<RoleTab>('investor');
  const [mode, setMode] = useState<Mode>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState<string | null>(null);

  // 이미 로그인된 세션이면 전역 상태 동기화
  useEffect(() => {
    const sync = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getSession();
        if (data.session) login();
      } catch {
        // ignore
      }
    };
    sync();
  }, [login]);

  const handleKakaoLogin = async () => {
    setIsLoading('kakao');
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: 'http://localhost:3000/auth/callback',
        },
      });

      if (error) {
        console.error('카카오 로그인 오류:', error);
        alert('카카오 로그인 연결 실패: ' + error.message);
        setIsLoading(null);
      }
      // 성공 시 리다이렉트 시작 (여기서 login()은 호출하지 않음)
    } catch (error) {
      console.error(error);
      alert('카카오 로그인 연결 실패');
      setIsLoading(null);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading('google');
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:3000/auth/callback',
        },
      });

      if (error) {
        console.error('구글 로그인 오류:', error);
        alert('구글 로그인 연결 실패: ' + error.message);
        setIsLoading(null);
      }
    } catch (error) {
      console.error(error);
      alert('구글 로그인 연결 실패');
      setIsLoading(null);
    }
  };

  // ✅ 이메일 로그인/회원가입 (Supabase)
  const handleEmailSubmit = async () => {
    if (!email || !password) return alert('이메일과 비밀번호를 입력해주세요.');
    if (password.length < 6) return alert('비밀번호는 6자리 이상이어야 합니다.');

    setIsLoading('email');
    try {
      const supabase = createClient();

      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          alert('이메일 로그인 실패: ' + error.message);
          return;
        }

        if (data.session) {
          login();
          router.push('/');
        } else {
          alert('로그인 세션을 만들지 못했습니다. (session 없음)');
        }
      } else {
        // signup
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: activeTab, // investor | creator
            },
          },
        });

        if (error) {
          alert('회원가입 실패: ' + error.message);
          return;
        }

        // Supabase 설정에 따라:
        // - 이메일 인증 ON: data.session이 null일 수 있음 (확인메일 필요)
        // - 이메일 인증 OFF: 바로 session 생성될 수 있음
        if (data.session) {
          login();
          router.push('/');
        } else {
          alert('회원가입 요청 완료! 메일함에서 인증 메일을 확인해주세요.');
        }
      }
    } catch (e: any) {
      console.error(e);
      alert('이메일 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(null);
    }
  };

  // (현재 방식 유지) 메타마스크 지갑 연결
  const handleWalletLogin = async () => {
    setIsLoading('wallet');
    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts?.[0]) {
          alert(`지갑 연결 성공! \n주소: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
          // NOTE: 여기서는 "지갑 연결"만 처리 (진짜 로그인/가입은 SIWE 등으로 추후 연결)
          login();
          router.push('/');
        } else {
          alert('지갑 주소를 가져오지 못했습니다.');
        }
      } else {
        alert('메타마스크가 설치되어 있지 않습니다.');
      }
    } catch (error) {
      console.error(error);
      alert('지갑 연결 취소 또는 실패');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 헤더 */}
      <div className="relative flex items-center justify-center h-[60px] px-4">
        <button onClick={() => router.back()} className="absolute left-4 p-2 -ml-2 text-slate-900">
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="flex-1 px-5 pt-4 pb-10 flex flex-col max-w-[480px] mx-auto w-full">
        {/* 타이틀 */}
        <h1 className="text-2xl font-bold text-slate-900 text-center mb-2">
          {mode === 'login' ? (
            <>
              간편하게 로그인하고<br />투자를 시작하세요
            </>
          ) : (
            <>
              3초만에 가입하고<br />투자를 시작하세요
            </>
          )}
        </h1>

        {/* 로그인/회원가입 전환 */}
        <div className="flex justify-center gap-2 mb-8 mt-4">
          <button
            onClick={() => setMode('login')}
            className={`px-4 py-2 rounded-full text-sm font-bold border ${
              mode === 'login' ? 'bg-black text-white border-black' : 'bg-white text-slate-700 border-gray-200'
            }`}
          >
            로그인
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`px-4 py-2 rounded-full text-sm font-bold border ${
              mode === 'signup' ? 'bg-black text-white border-black' : 'bg-white text-slate-700 border-gray-200'
            }`}
          >
            회원가입
          </button>
        </div>

        {/* 탭 메뉴 */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-8">
          <button
            onClick={() => setActiveTab('investor')}
            className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${
              activeTab === 'investor' ? 'bg-white text-[#191F28] shadow-sm' : 'text-gray-400'
            }`}
          >
            일반 투자자
          </button>
          <button
            onClick={() => setActiveTab('creator')}
            className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${
              activeTab === 'creator' ? 'bg-white text-[#191F28] shadow-sm' : 'text-gray-400'
            }`}
          >
            크리에이터 (전문가)
          </button>
        </div>

        {/* 소셜 로그인 버튼들 */}
        <div className="space-y-3 mb-8">
          <button
            onClick={handleKakaoLogin}
            disabled={!!isLoading}
            className="w-full bg-[#FEE500] text-[#391B1E] py-4 rounded-xl font-bold flex items-center justify-center gap-2 relative active:scale-[0.98] transition-transform disabled:opacity-60"
          >
            <MessageCircle size={20} fill="#391B1E" className="absolute left-5" />
            {isLoading === 'kakao' ? '연결 중...' : '카카오로 시작하기'}
          </button>

          <button
            onClick={handleGoogleLogin}
            disabled={!!isLoading}
            className="w-full bg-white border border-gray-200 text-slate-700 py-4 rounded-xl font-bold flex items-center justify-center gap-2 relative active:scale-[0.98] transition-transform disabled:opacity-60"
          >
            <Globe size={20} className="absolute left-5" />
            {isLoading === 'google' ? '연결 중...' : '구글로 시작하기'}
          </button>

          <button
            onClick={handleWalletLogin}
            disabled={!!isLoading}
            className="w-full bg-[#3182F6] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 relative active:scale-[0.98] transition-transform disabled:opacity-60"
          >
            <Wallet size={20} className="absolute left-5" />
            {isLoading === 'wallet' ? '지갑 확인 중...' : '지갑 연결 (Metamask)'}
          </button>
        </div>

        {/* 구분선 */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-[1px] bg-gray-200 flex-1"></div>
          <span className="text-xs text-gray-400">또는 이메일로 시작하기</span>
          <div className="h-[1px] bg-gray-200 flex-1"></div>
        </div>

        {/* 이메일 폼 */}
        <div className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일"
            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 text-slate-900 outline-none focus:border-black focus:bg-white transition-all placeholder:text-gray-400"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호 (6자리 이상)"
            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 text-slate-900 outline-none focus:border-black focus:bg-white transition-all placeholder:text-gray-400"
          />
          <button
            onClick={handleEmailSubmit}
            disabled={!!isLoading}
            className="w-full bg-[#191F28] text-white py-4 rounded-xl font-bold active:scale-[0.98] transition-transform mt-2 disabled:opacity-60"
          >
            {isLoading === 'email'
              ? mode === 'login'
                ? '로그인 중...'
                : '가입 중...'
              : mode === 'login'
              ? '이메일로 로그인'
              : '이메일로 회원가입'}
          </button>
        </div>

        {/* 안내 */}
        <div className="mt-6 text-center">
          {mode === 'login' ? (
            <>
              <span className="text-xs text-gray-400">아직 계정이 없으신가요? </span>
              <button
                className="text-xs font-bold text-slate-900 underline ml-1"
                onClick={() => setMode('signup')}
              >
                회원가입
              </button>
            </>
          ) : (
            <>
              <span className="text-xs text-gray-400">이미 계정이 있으신가요? </span>
              <button
                className="text-xs font-bold text-slate-900 underline ml-1"
                onClick={() => setMode('login')}
              >
                로그인
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

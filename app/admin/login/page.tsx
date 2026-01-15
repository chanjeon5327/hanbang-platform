'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MessageCircle, Globe, Wallet } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useStore } from '@/context/StoreContext';

type ActiveTab = 'investor' | 'creator';
type AuthMode = 'login' | 'signup';

export default function LoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const { login } = useStore();

  const [activeTab, setActiveTab] = useState<ActiveTab>('investor');
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState<string | null>(null);

  const redirectTo = 'http://localhost:3000/auth/callback';

  // [1] 카카오 로그인 (Supabase)
  const handleKakaoLogin = async () => {
    setIsLoading('kakao');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: { redirectTo },
      });

      if (error) {
        console.error('카카오 로그인 오류:', error);
        alert('카카오 로그인 연결 실패: ' + error.message);
        setIsLoading(null);
        return;
      }

      // OAuth는 리다이렉트가 시작됨
      login();
    } catch (e) {
      console.error(e);
      alert('카카오 로그인 연결 실패');
      setIsLoading(null);
    }
  };

  // [2] 구글 로그인 (Supabase)
  const handleGoogleLogin = async () => {
    setIsLoading('google');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      });

      if (error) {
        console.error('구글 로그인 오류:', error);
        alert('구글 로그인 연결 실패: ' + error.message);
        setIsLoading(null);
        return;
      }

      login();
    } catch (e) {
      console.error(e);
      alert('구글 로그인 연결 실패');
      setIsLoading(null);
    }
  };

  // [3] 이메일 로그인 / 회원가입 (Supabase)
  const handleEmailSubmit = async () => {
    if (!email || !password) return alert('이메일과 비밀번호를 입력해주세요.');
    if (password.length < 6) return alert('비밀번호는 6자리 이상이어야 합니다.');

    setIsLoading('email');

    try {
      if (authMode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error('이메일 로그인 오류:', error);
          alert('이메일 로그인 실패: ' + error.message);
          return;
        }

        if (data.session) {
          login();
          router.push('/');
        } else {
          // 드물지만 세션이 없는 케이스 대비
          alert('로그인 세션이 생성되지 않았습니다. 다시 시도해주세요.');
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectTo,
            data: {
              userType: activeTab, // investor | creator
            },
          },
        });

        if (error) {
          console.error('이메일 회원가입 오류:', error);
          alert('회원가입 실패: ' + error.message);
          return;
        }

        // 이메일 인증이 켜져있으면 여기서 바로 로그인 안 될 수 있음
        if (data.session) {
          login();
          router.push('/');
        } else {
          alert('회원가입 요청이 완료되었습니다. 이메일 인증이 필요할 수 있어요. (메일함 확인)');
          // UX상 로그인 모드로 돌아가도 좋음
          setAuthMode('login');
        }
      }
    } catch (e) {
      console.error(e);
      alert(authMode === 'login' ? '이메일 로그인 실패' : '회원가입 실패');
    } finally {
      setIsLoading(null);
    }
  };

  // [4] 메타마스크 지갑 연결 (수동 처리 유지)
  const handleWalletLogin = async () => {
    setIsLoading('wallet');

    try {
      const eth = (window as any).ethereum;
      if (!eth) {
        alert('메타마스크가 설치되어 있지 않습니다. (시크릿 모드면 “시크릿 모드에서 허용” 체크 필요)');
        return;
      }

      const accounts = await eth.request({ method: 'eth_requestAccounts' });

      if (accounts?.[0]) {
        alert(`지갑 연결 성공!\n주소: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
        login();
        router.push('/');
      }
    } catch (e) {
      console.error(e);
      alert('지갑 연결 취소 또는 실패');
    } finally {
      setIsLoading(null);
    }
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
      </div>

      <div className="flex-1 px-5 pt-4 pb-10 flex flex-col max-w-[480px] mx-auto w-full">
        {/* 타이틀 */}
        <h1 className="text-2xl font-bold text-slate-900 text-center mb-6">
          간편하게 로그인하고<br />투자를 시작하세요
        </h1>

        {/* 로그인/회원가입 토글 */}
        <div className="flex justify-center gap-2 mb-6">
          <button
            onClick={() => setAuthMode('login')}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
              authMode === 'login'
                ? 'bg-[#191F28] text-white'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            로그인
          </button>
          <button
            onClick={() => setAuthMode('signup')}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
              authMode === 'signup'
                ? 'bg-[#191F28] text-white'
                : 'bg-gray-100 text-gray-500'
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
              activeTab === 'investor'
                ? 'bg-white text-[#191F28] shadow-sm'
                : 'text-gray-400'
            }`}
          >
            일반 투자자
          </button>
          <button
            onClick={() => setActiveTab('creator')}
            className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${
              activeTab === 'creator'
                ? 'bg-white text-[#191F28] shadow-sm'
                : 'text-gray-400'
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
            className="w-full bg-[#FEE500] text-[#391B1E] py-4 rounded-xl font-bold flex items-center justify-center gap-2 relative active:scale-[0.98] transition-transform"
          >
            <MessageCircle size={20} fill="#391B1E" className="absolute left-5" />
            {isLoading === 'kakao' ? '연결 중...' : '카카오로 시작하기'}
          </button>

          <button
            onClick={handleGoogleLogin}
            disabled={!!isLoading}
            className="w-full bg-white border border-gray-200 text-slate-700 py-4 rounded-xl font-bold flex items-center justify-center gap-2 relative active:scale-[0.98] transition-transform"
          >
            <Globe size={20} className="absolute left-5" />
            {isLoading === 'google' ? '연결 중...' : '구글로 시작하기'}
          </button>

          <button
            onClick={handleWalletLogin}
            disabled={!!isLoading}
            className="w-full bg-[#3182F6] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 relative active:scale-[0.98] transition-transform"
          >
            <Wallet size={20} className="absolute left-5" />
            {isLoading === 'wallet' ? '지갑 확인 중...' : '지갑 연결 (Metamask)'}
          </button>
        </div>

        {/* 구분선 */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-[1px] bg-gray-200 flex-1"></div>
          <span className="text-xs text-gray-400">
            {authMode === 'login' ? '또는 이메일로 로그인' : '또는 이메일로 회원가입'}
          </span>
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
            className="w-full bg-[#191F28] text-white py-4 rounded-xl font-bold active:scale-[0.98] transition-transform mt-2"
          >
            {isLoading === 'email'
              ? (authMode === 'login' ? '로그인 중...' : '가입 중...')
              : (authMode === 'login' ? '이메일로 로그인' : '이메일로 회원가입')}
          </button>
        </div>
      </div>
    </div>
  );
}

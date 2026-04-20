'use client';

import { createClient } from '@supabase/supabase-js';
import { useToast } from '@/context/ToastContext';

export default function KakaoLogin() {
  const { toast } = useToast();
  const handleKakaoLogin = async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase 환경변수가 설정되지 않았습니다.');
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // QA L2 대응: localhost 하드코딩 제거. 현재 origin 기준으로 콜백을 구성한다.
    const redirectTo =
      typeof window !== 'undefined'
        ? `${window.location.origin}/auth/callback`
        : '/auth/callback';

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo,
      },
    });

    if (error) {
      console.error('카카오 로그인 오류:', error);
      toast('로그인에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <button
      onClick={handleKakaoLogin}
      className="flex items-center justify-center gap-3 w-full max-w-sm px-6 py-4 bg-[#FEE500] hover:bg-[#FDD835] rounded-lg font-semibold text-[#000000] body shadow-md hover:opacity-95 transition-opacity duration-200 active:opacity-90"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <path
          d="M10 0C4.48 0 0 3.52 0 7.86C0 11.3 2.38 14.24 5.88 15.46L4.96 18.74C4.85 19.11 5.13 19.46 5.5 19.35L9.48 18.03C9.82 18.01 10.18 18.01 10.52 18.03L14.5 19.35C14.87 19.46 15.15 19.11 15.04 18.74L14.12 15.46C17.62 14.24 20 11.3 20 7.86C20 3.52 15.52 0 10 0Z"
          fill="#000000"
        />
      </svg>
      카카오로 시작하기
    </button>
  );
}


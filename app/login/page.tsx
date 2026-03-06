'use client';

import { Suspense, useMemo, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './login.module.css';
import { getBrowserSupabase } from '@/utils/supabase/client';

type Tab = 'investor' | 'creator';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => getBrowserSupabase(), []);

  const [tab, setTab] = useState<Tab>('investor');
  const [email, setEmail] = useState('test@hanbang.com');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  const redirectTo = searchParams.get('redirect') || searchParams.get('redirectTo') || searchParams.get('next') || '/';

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (cancelled) return;
      const hasUser = !!user;
      if (process.env.NODE_ENV === 'development') {
        console.info('[LOGIN-REDIRECT-SOURCE] app/login/page.tsx', { pathname: '/login', user: hasUser, session: !!user, isAuthed: hasUser });
      }
      setSessionChecked(true);
      // /login 에서 자동 redirect 완전 차단 - 이미 로그인된 경우에도 페이지 유지
      // 로그인 성공 시에만 signInEmail/signInOAuth/connectWallet 내부에서 router.push
    };
    check();
    return () => { cancelled = true; };
  }, [supabase]);

  async function signInOAuth(provider: 'kakao' | 'google') {
    setBusy(true);
    setError(null);
    try {
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: { redirectTo },
      });
      if (error) throw error;
      // redirect는 supabase가 처리
    } catch (e: any) {
      setError(e?.message || 'OAuth 로그인에 실패했습니다.');
      setBusy(false);
    }
  }

  async function connectWallet() {
    setBusy(true);
    setError(null);
    try {
      const eth = (window as any).ethereum;
      if (!eth) {
        setError('MetaMask 확장프로그램이 필요합니다.');
        setBusy(false);
        return;
      }
      await eth.request({ method: 'eth_requestAccounts' });
      // 지갑 로그인/연동은 이후 단계(지금은 UI 먼저 완성)
      router.push(redirectTo);
    } catch (e: any) {
      setError(e?.message || '지갑 연결에 실패했습니다.');
      setBusy(false);
    }
  }

  async function signInEmail(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.replace(redirectTo);
    } catch (e: any) {
      setError(e?.message || '이메일 로그인에 실패했습니다.');
      setBusy(false);
    }
  }

  async function signUpEmail() {
    setBusy(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
      setError('가입 메일을 확인해 주세요.');
      setBusy(false);
    } catch (e: any) {
      setError(e?.message || '회원가입에 실패했습니다.');
      setBusy(false);
    }
  }

  if (!sessionChecked) {
    return (
      <div className={styles.page}>
        <div className={styles.wrap}>
          <div className={styles.title}>투자를 시작하세요</div>
          <div className="animate-pulse h-64 rounded-xl mt-4" style={{ backgroundColor: 'var(--legacy-border)' }} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.wrap}>
        <div className={styles.title}>투자를 시작하세요</div>

        <div className={styles.card}>
          <div className={styles.tabRow}>
            <button
              type="button"
              className={`${styles.tab} ${tab === 'investor' ? styles.tabActive : ''}`}
              onClick={() => setTab('investor')}
              disabled={busy}
            >
              일반 투자자
            </button>
            <button
              type="button"
              className={`${styles.tab} ${tab === 'creator' ? styles.tabActive : ''}`}
              onClick={() => setTab('creator')}
              disabled={busy}
            >
              크리에이터 (전문가)
            </button>
          </div>

          <button
            type="button"
            className={styles.kakaoBtn}
            onClick={() => signInOAuth('kakao')}
            disabled={busy}
          >
            카카오로 시작하기
          </button>

          <button
            type="button"
            className={styles.googleBtn}
            onClick={() => signInOAuth('google')}
            disabled={busy}
          >
            구글로 시작하기
          </button>

          <button
            type="button"
            className={styles.walletBtn}
            onClick={connectWallet}
            disabled={busy}
          >
            지갑 연결 (Metamask)
          </button>

          <div className={styles.dividerRow}>
            <div className={styles.dividerLine} />
            <div className={styles.dividerText}>또는 이메일로 시작하기</div>
            <div className={styles.dividerLine} />
          </div>

          <form onSubmit={signInEmail} className={styles.form}>
            <input
              className={styles.input}
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={busy}
              autoComplete="email"
            />
            <input
              className={styles.input}
              placeholder="비밀번호 (6자리 이상)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={busy}
              type="password"
              autoComplete="current-password"
            />

            <button className={styles.emailLoginBtn} type="submit" disabled={busy}>
              이메일로 로그인
            </button>
          </form>

          {error ? <div className={styles.error}>{error}</div> : null}

          <div className={styles.links}>
            <button
              type="button"
              className={styles.linkBtn}
              onClick={() => router.push('/login')}
              disabled={busy}
            >
              비밀번호 찾기
            </button>
            <span className={styles.dot}>·</span>
            <button type="button" className={styles.linkBtn} onClick={signUpEmail} disabled={busy} style={{ color: '#2563EB' }}>
              회원가입
            </button>
          </div>

          <div className={styles.note}>
            선택된 유형: <b>{tab === 'investor' ? '일반 투자자' : '크리에이터(전문가)'}</b>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className={styles.page}><div className={styles.wrap}><div className={styles.title}>투자를 시작하세요</div><div className="animate-pulse h-64 rounded-xl bg-[var(--legacy-border)]" /></div></div>}>
      <LoginContent />
    </Suspense>
  );
}

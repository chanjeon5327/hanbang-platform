'use client';

import { Suspense, useMemo, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './login.module.css';
import { getBrowserSupabase } from '@/utils/supabase/client';
import { getPostLoginRoute, sanitizeRedirect } from '@/lib/auth/getPostLoginRoute';
import { toUserFriendlyAuthError } from '@/lib/auth/authErrorMessages';

type Tab = 'investor' | 'creator';
type AuthMode = 'login' | 'signup';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => getBrowserSupabase(), []);

  const [tab, setTab] = useState<Tab>('investor');
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  const redirectParam = sanitizeRedirect(
    searchParams.get('redirect') || searchParams.get('redirectTo') || searchParams.get('next') || '/'
  );

  useEffect(() => {
    const m = (searchParams.get('mode') === 'signup' ? 'signup' : 'login') as AuthMode;
    setMode(m);
    const err = searchParams.get('error');
    if (err === 'oauth_failed') setError('소셜 로그인에 실패했습니다. 다시 시도해 주세요.');
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      // getUser() 대신 getSession() 사용 - 세션 없을 때 AuthSessionMissingError 방지
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      const hasUser = !!session?.user;
      if (process.env.NODE_ENV === 'development') {
        console.info('[LOGIN-REDIRECT-SOURCE] app/login/page.tsx', { pathname: '/login', user: hasUser, session: hasUser, isAuthed: hasUser });
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
      const cb = new URL('/auth/callback', window.location.origin);
      cb.searchParams.set('redirect', redirectParam);
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: cb.toString() },
      });
      if (err) throw err;
    } catch (e: any) {
      setError(toUserFriendlyAuthError(e?.message, `${provider === 'google' ? '구글' : '카카오'} 로그인에 실패했습니다.`));
      setBusy(false);
    }
  }

  async function connectWallet() {
    setBusy(true);
    setError(null);
    try {
      const eth = (window as any).ethereum;
      if (!eth) {
        setError('MetaMask 확장프로그램이 필요합니다. 브라우저 확장을 설치해 주세요.');
        setBusy(false);
        return;
      }
      await eth.request({ method: 'eth_requestAccounts' });
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const path = await getPostLoginRoute(supabase, redirectParam);
        router.push(path);
      } else {
        setError('지갑이 연결되었습니다. 서비스 이용을 위해 이메일 또는 소셜 로그인으로 계정을 만들어 주세요.');
        setBusy(false);
      }
    } catch (e: any) {
      setError(toUserFriendlyAuthError(e?.message, '지갑 연결에 실패했습니다. MetaMask가 잠금 해제되어 있는지 확인해 주세요.'));
      setBusy(false);
    }
  }

  async function signInEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('이메일과 비밀번호를 입력해 주세요.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      const path = await getPostLoginRoute(supabase, redirectParam);
      router.replace(path);
    } catch (e: any) {
      setError(toUserFriendlyAuthError(e?.message, '이메일 로그인에 실패했습니다.'));
      setBusy(false);
    }
  }

  async function signUpEmail(e?: React.FormEvent) {
    e?.preventDefault();
    if (!email.trim() || !password || password.length < 6) {
      setError('이메일과 비밀번호(6자 이상)를 입력해 주세요.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const cb = new URL('/auth/callback', window.location.origin);
      cb.searchParams.set('redirect', redirectParam);
      const { data, error: err } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: cb.toString() },
      });
      if (err) throw err;
      if (data.session) {
        const path = await getPostLoginRoute(supabase, redirectParam);
        router.replace(path);
        return;
      }
      setError('가입 메일을 확인해 주세요.');
    } catch (e: any) {
      setError(toUserFriendlyAuthError(e?.message, '회원가입에 실패했습니다.'));
    } finally {
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

          <div className={styles.tabRow} style={{ marginBottom: '12px' }}>
            <button
              type="button"
              className={`${styles.tab} ${mode === 'login' ? styles.tabActive : ''}`}
              onClick={() => { setMode('login'); setError(null); }}
              disabled={busy}
            >
              로그인
            </button>
            <button
              type="button"
              className={`${styles.tab} ${mode === 'signup' ? styles.tabActive : ''}`}
              onClick={() => { setMode('signup'); setError(null); }}
              disabled={busy}
            >
              회원가입
            </button>
          </div>

          <form onSubmit={mode === 'signup' ? signUpEmail : signInEmail} className={styles.form}>
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
              {busy ? '처리 중…' : mode === 'signup' ? '회원가입하기' : '이메일로 로그인'}
            </button>
          </form>

          {error ? <div className={styles.error}>{error}</div> : null}

          <div className={styles.links}>
            {mode === 'login' && (
              <>
                <button
                  type="button"
                  className={styles.linkBtn}
                  onClick={() => router.push('/login')}
                  disabled={busy}
                >
                  비밀번호 찾기
                </button>
                <span className={styles.dot}>·</span>
              </>
            )}
            <button
              type="button"
              className={styles.linkBtn}
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); }}
              disabled={busy}
              style={{ color: '#2563EB' }}
            >
              {mode === 'login' ? '회원가입' : '로그인'}
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

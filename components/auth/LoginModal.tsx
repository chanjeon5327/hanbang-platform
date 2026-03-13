'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import styles from './login-modal.module.css';
import { getBrowserSupabase } from '@/utils/supabase/client';
import { getPostLoginRoute } from '@/lib/auth/getPostLoginRoute';

type Tab = 'investor' | 'creator';

export default function LoginModal(props: any) {
  const router = useRouter();
  const pathname = usePathname() ?? '/';
  const supabase = useMemo(() => getBrowserSupabase(), []);

  // ---- tolerant props (call sites differ) ----
  const redirectParam = props?.redirect ?? pathname;
  const open: boolean = !!(props?.open ?? props?.isOpen ?? props?.visible);
  const onOpenChange =
    props?.onOpenChange ??
    props?.setOpen ??
    props?.onClose ??
    ((v: boolean) => {
      if (!v && typeof props?.onRequestClose === 'function') props.onRequestClose();
    });

  const onSuccess = props?.onSuccess;
  const refreshSession = props?.refreshSession;

  const [tab, setTab] = useState<Tab>('investor');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [busy, setBusy] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setBusy(false);
    // ESC close
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange?.(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  if (!open) return null;

  async function signInOAuth(provider: 'kakao' | 'google') {
    setBusy(true);
    setError(null);
    try {
      const cb = new URL('/auth/callback', window.location.origin);
      cb.searchParams.set('redirect', redirectParam);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: { redirectTo: cb.toString() },
      });
      if (error) throw error;
      // redirect handled by supabase
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
      const path = await getPostLoginRoute(supabase, redirectParam);
      if (typeof refreshSession === 'function') await refreshSession();
      if (typeof onSuccess === 'function') await onSuccess();
      onOpenChange?.(false);
      router.push(path);
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
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const path = await getPostLoginRoute(supabase, redirectParam);
      if (typeof refreshSession === 'function') await refreshSession();
      if (typeof onSuccess === 'function') await onSuccess();
      onOpenChange?.(false);
      router.push(path);
    } catch (e: any) {
      setError(e?.message || '이메일 로그인에 실패했습니다.');
      setBusy(false);
    }
  }

  async function signUpEmail() {
    if (!email.trim() || !password || password.length < 6) {
      setError('이메일과 비밀번호(6자 이상)를 입력해 주세요.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const cb = new URL('/auth/callback', window.location.origin);
      cb.searchParams.set('redirect', redirectParam);
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: cb.toString() },
      });
      if (error) throw error;
      if (data.session) {
        const path = await getPostLoginRoute(supabase, redirectParam);
        if (typeof refreshSession === 'function') await refreshSession();
        if (typeof onSuccess === 'function') await onSuccess();
        onOpenChange?.(false);
        router.push(path);
        return;
      }
      setError('가입 메일을 확인해 주세요.');
    } catch (e: any) {
      setError(e?.message || '회원가입에 실패했습니다.');
    } finally {
      setBusy(false);
    }
  }

  function onOverlayDown(e: React.MouseEvent) {
    // click outside closes
    if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
      onOpenChange?.(false);
    }
  }

  return (
    <div className={styles.overlay} onMouseDown={onOverlayDown} aria-modal="true" role="dialog">
      <div className={styles.panel} ref={panelRef}>
        <div className={styles.headerRow}>
          <div className={styles.modalTitle}>로그인</div>
          <button className={styles.closeBtn} onClick={() => onOpenChange?.(false)} disabled={busy}>
            닫기
          </button>
        </div>

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
            크리에이터(전문가)
          </button>
        </div>

        <button type="button" className={styles.kakaoBtn} onClick={() => signInOAuth('kakao')} disabled={busy}>
          카카오로 시작하기
        </button>

        <button type="button" className={styles.googleBtn} onClick={() => signInOAuth('google')} disabled={busy}>
          Google로 시작하기
        </button>

        <button type="button" className={styles.walletBtn} onClick={connectWallet} disabled={busy}>
          지갑 연결 (MetaMask)
        </button>

        <div className={styles.dividerRow}>
          <div className={styles.dividerLine} />
          <div className={styles.dividerText}>또는</div>
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
            placeholder="비밀번호"
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
          <span className={styles.muted}>계정이 없으신가요?</span>
          <button type="button" className={styles.linkBtn} onClick={signUpEmail} disabled={busy}>
            회원가입
          </button>
        </div>

        <div className={styles.note}>
          선택된 유형: <b>{tab === 'investor' ? '일반 투자자' : '크리에이터(전문가)'}</b>
        </div>
      </div>
    </div>
  );
}

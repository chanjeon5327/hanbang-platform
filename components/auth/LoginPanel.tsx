'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { login } from '@/lib/auth/client';
import { getBrowserSupabase } from '@/utils/supabase/client';
import { useToast } from '@/context/ToastContext';
import { WalletConnect } from '@/components/WalletConnect';
import { Loader2 } from 'lucide-react';

type TabId = 'investor' | 'creator';

type LoginPanelProps = {
  onSuccess?: () => void | Promise<void>;
  onClose?: () => void;
  showCloseButton?: boolean;
  embedded?: boolean;
};

export default function LoginPanel({ onSuccess, onClose, showCloseButton = false }: LoginPanelProps) {
  const { toast } = useToast();
  const pathname = usePathname() ?? '/';
  const [tab, setTab] = useState<TabId>('investor');
  const [showWallet, setShowWallet] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await login(email.trim(), password);

    if (result.ok) {
      onClose?.();
      await onSuccess?.();
      toast('로그인에 성공했습니다.');
      return;
    }

    setError(result.error ?? '로그인에 실패했습니다.');
    setLoading(false);
  };

  const handleOAuth = async (provider: 'kakao' | 'google') => {
    const supabase = getBrowserSupabase();
    if (!supabase?.auth) {
      toast('로그인을 사용할 수 없습니다.');
      return;
    }

    const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '/auth/callback';

    const { error: err } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });

    if (err) {
      toast(err.message || '로그인에 실패했습니다.');
    }
  };

  const handleWalletConnected = () => {
    onClose?.();
    onSuccess?.();
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: 'investor', label: '일반 투자자' },
    { id: 'creator', label: '크리에이터(전문가)' },
  ];

  return (
    <div
      className="hb-legacy w-full max-w-[420px] rounded-2xl overflow-hidden"
      style={{
        backgroundColor: 'var(--legacy-card)',
        border: '1px solid var(--legacy-card-border)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="px-5 py-4 flex justify-between items-center" style={{ borderBottom: '1px solid var(--legacy-border)' }}>
        <h2 className="font-bold text-lg" style={{ color: 'var(--legacy-text)' }}>
          로그인
        </h2>
        {showCloseButton && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-medium hover:opacity-80"
            style={{ color: 'var(--legacy-text-muted)' }}
          >
            닫기
          </button>
        )}
      </div>

      {/* 탭: 일반 투자자 / 크리에이터 */}
      <div className="flex" style={{ borderBottom: '1px solid var(--legacy-border)' }}>
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className="flex-1 py-3.5 text-sm font-medium transition"
            style={{
              color: tab === id ? 'var(--legacy-point)' : 'var(--legacy-text-muted)',
              borderBottom: tab === id ? '2px solid var(--legacy-point)' : '2px solid transparent',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="p-5 space-y-4">
        {/* 카카오 / 구글 / 지갑연결 */}
        {showWallet ? (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setShowWallet(false)}
              className="text-sm font-medium"
              style={{ color: 'var(--legacy-text-muted)' }}
            >
              ← 뒤로
            </button>
            <WalletConnect
              onConnect={handleWalletConnected}
            />
          </div>
        ) : (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => handleOAuth('kakao')}
            className="flex items-center justify-center gap-3 w-full px-6 py-3.5 rounded-xl font-semibold text-[#000000] text-[15px] transition hover:opacity-90"
            style={{ backgroundColor: '#FEE500' }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="flex-shrink-0">
              <path
                d="M10 0C4.48 0 0 3.52 0 7.86C0 11.3 2.38 14.24 5.88 15.46L4.96 18.74C4.85 19.11 5.13 19.46 5.5 19.35L9.48 18.03C9.82 18.01 10.18 18.01 10.52 18.03L14.5 19.35C14.87 19.46 15.15 19.11 15.04 18.74L14.12 15.46C17.62 14.24 20 11.3 20 7.86C20 3.52 15.52 0 10 0Z"
                fill="#000000"
              />
            </svg>
            카카오로 시작하기
          </button>
          <button
            type="button"
            onClick={() => handleOAuth('google')}
            className="flex items-center justify-center gap-3 w-full px-6 py-3.5 rounded-xl font-semibold text-gray-800 text-[15px] bg-white hover:bg-gray-50 border border-gray-200 transition"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" className="flex-shrink-0">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google로 시작하기
          </button>
          <button
            type="button"
            onClick={() => setShowWallet(true)}
            className="flex items-center justify-center gap-3 w-full px-6 py-3.5 rounded-xl font-semibold text-white text-[15px] transition hover:opacity-90"
            style={{ backgroundColor: '#3B82F6' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0">
              <path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7 1.49 0 2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5S21.88 11 20.5 11z" />
            </svg>
            지갑 연결 (MetaMask)
          </button>
        </div>
        )}

        {!showWallet && (
          <>
        {/* 구분선 */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--legacy-border)' }} />
          <span className="text-xs font-medium" style={{ color: 'var(--legacy-text-muted)' }}>또는</span>
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--legacy-border)' }} />
        </div>

        {/* 이메일/비밀번호 */}
        <form onSubmit={handleEmailLogin} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일"
            required
            className="w-full rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:ring-2"
            style={{
              backgroundColor: 'rgba(0,0,0,0.2)',
              border: '1px solid var(--legacy-border)',
              color: 'var(--legacy-text)',
            }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            required
            className="w-full rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:ring-2"
            style={{
              backgroundColor: 'rgba(0,0,0,0.2)',
              border: '1px solid var(--legacy-border)',
              color: 'var(--legacy-text)',
            }}
          />
          {error && <p className="text-sm" style={{ color: '#EF4444' }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-[15px] text-white transition disabled:opacity-50"
            style={{ backgroundColor: '#111827' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={18} className="animate-spin" />
                처리 중…
              </span>
            ) : (
              '이메일로 로그인'
            )}
          </button>
        </form>

        {/* 회원가입 링크 */}
        <p className="text-center text-sm" style={{ color: 'var(--legacy-text-muted)' }}>
          계정이 없으신가요?{' '}
          <Link
            href={`/login?mode=signup&redirect=${encodeURIComponent(pathname)}`}
            onClick={() => onClose?.()}
            className="font-semibold"
            style={{ color: 'var(--legacy-point)' }}
          >
            회원가입
          </Link>
        </p>
          </>
        )}
      </div>
    </div>
  );
}
